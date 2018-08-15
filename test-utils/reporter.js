HybridTestReporter = (function() {
    "use strict";

    function Logger(platform) {
        this.timers = {};
        this.level = 0;
        this.platform = platform;
    }

    Logger.prototype.time = function(label) {
        this.timers[label] = Date.now();
    };

    Logger.prototype.timeEnd = function(label) {
        this.callNative('Sdk', 'logDebug', [(new Array(this.level)).join('\t') + label + ': ' + Date.now() - this.timers[label] + 'ms']);
        delete this.timers[label];
    };

    Logger.prototype.group = function(label) {
        this.callNative('Sdk', 'logDebug', [(new Array(this.level)).join('\t') + label]);
        this.level++;
    };

    Logger.prototype.groupEnd = function() {
        this.level--;
    };

    Logger.prototype.log = function(message) {
        this.callNative('Sdk', 'logDebug', [(new Array(this.level)).join('\t') + message]);
    };

    Logger.prototype.error = function(message) {
        this.callNative('Sdk', 'logError', [(new Array(this.level)).join('\t') + message]);
    };

    Logger.prototype.callNative = function(className, methodName, parameters) {
        if(this.platform === 'android') {
            window.webviewbridge.handleInvocation(JSON.stringify([['com.unity3d.ads.api.' + className, methodName, parameters, 'null']]));
        } else if(this.platform === 'ios') {
            if (window.webkit) {
                window.webkit.messageHandlers.handleInvocation.postMessage(JSON.stringify([['UADSApi' + className, methodName, parameters, 'null']]));
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://webviewbridge.unityads.unity3d.com/handleInvocation', false);
                xhr.send(JSON.stringify([['UADSApi' + className, methodName, parameters, 'null']]));
            }
        } else {
            console.log(parameters[0]);
        }
    };

    function BaseReporter(runner) {
        if(!runner) return;

        var stats = this.stats = {suites: 0, tests: 0, passes: 0, pending: 0, failures: 0};
        var failures = this.failures = [];

        runner.stats = stats;

        runner.on('start', function() {
            stats.start = new Date;
        });

        runner.on('suite', function(suite) {
            stats.suites = stats.suites || 0;
            suite.root || stats.suites++;
        });

        runner.on('Test end', function(test) {
            stats.tests = stats.tests || 0;
            stats.tests++;
        });

        runner.on('pass', function(test) {
            stats.passes = stats.passes || 0;

            var medium = test.slow() / 2;
            test.speed = test.duration > test.slow()
                ? 'slow'
                : test.duration > medium
                ? 'medium'
                : 'fast';

            stats.passes++;
        });

        runner.on('fail', function(test, err) {
            stats.failures = stats.failures || 0;
            stats.failures++;
            test.err = err;
            failures.push(test);
        });

        runner.on('end', function() {
            stats.end = new Date;
            stats.duration = new Date - stats.start;
        });

        runner.on('pending', function() {
            stats.pending++;
        });
    }

    function getPlatform() {
        try {
            var queryString = window.location.search.split('?')[1].split('&');
            for(var i = 0; i < queryString.length; i++) {
                var queryParam = queryString[i].split('=');
                if(queryParam[0] === 'platform') {
                    return queryParam[1];
                }
            }
        } catch(error) {}
        return undefined;
    }

    function HybridTestReporter(runner) {
        BaseReporter.call(this, runner);

        var failures = 0;
        var logger = new Logger(getPlatform());

        runner.on('start', function() {
            logger.time('duration');
        });

        runner.on('suite', function(suite) {
            if(suite.root) return;
            logger.group(suite.title);
        });

        runner.on('suite end', function(suite) {
            if(suite.root) return;
            logger.groupEnd();
        });

        runner.on('pending', function(test) {
            logger.log('pending: ' + test.title);
        });

        runner.on('pass', function(test) {
            if('fast' == test.speed) {
                logger.log('passed: ' + test.title);
            }
            else if('medium' == test.speed) {
                logger.log('passed: ' + test.title + ' in: ' + test.duration);
            }
            else {
                logger.log('passed: ' + test.title + ' in: ' + test.duration);
            }
        });

        runner.on('fail', function(test, err) {
            ++failures;
            logger.error('failed: ' + test.title + ' ** ' + err);
        });

        var self = this;
        runner.on('end', function() {
            var stats = self.stats;

            // duration
            logger.timeEnd('duration');

            // passes
            logger.log((stats.passes || 0) + ' passing');

            // pending
            if(stats.pending) {
                logger.log(stats.pending + ' pending');
            }

            // failures
            if(stats.failures) {
                logger.log(stats.failures + ' failing');
                errors.call(self, self.failures);
            }
        });

        function errors(failures) {
            failures.forEach(function(test, i) {
                // msg
                var err = test.err
                    , message = err.message || ''
                    , stack = err.stack || message
                    , index = stack.indexOf(message) + message.length
                    , msg = stack.slice(0, index)
                    , actual = err.actual
                    , expected = err.expected
                    , escape = true;

                // uncaught
                if(err.uncaught) {
                    msg = 'Uncaught ' + msg;
                }

                // indent stack trace without msg
                stack = stack.slice(index ? index + 1 : index).replace(/^/gm, '  ');

                logger.error('fail: ' + (i + 1) + ') ' + test.fullTitle() + '\n' + msg + '\n' + stack);
            });
        }
    }

    return HybridTestReporter;
})();
