var HybridTestReporter = (function () {
    "use strict";

    var s = 1000;
    var m = s * 60;
    var h = m * 60;
    var d = h * 24;

    function format(ms) {
        if (ms >= d) {
            return Math.round(ms / d) + 'd';
        }
        if (ms >= h) {
            return Math.round(ms / h) + 'h';
        }
        if (ms >= m) {
            return Math.round(ms / m) + 'm';
        }
        if (ms >= s) {
            return Math.round(ms / s) + 's';
        }
        return ms + 'ms';
    }

    var colors = {
        pass: 90,
        fail: 31,
        'bright pass': 92,
        'bright fail': 91,
        'bright yellow': 93,
        pending: 36,
        suite: 0,
        'error title': 0,
        'error message': 31,
        'error stack': 90,
        checkmark: 32,
        fast: 90,
        medium: 33,
        slow: 31,
        green: 32,
        light: 90,
        'diff gutter': 90,
        'diff added': 32,
        'diff removed': 31
    };

    var symbols = {
        ok: '✓',
        err: '✖',
        dot: '․',
        comma: ',',
        bang: '!'
    };

    var supportsAnsiColor = getPlatform() === undefined;

    function color(type, str) {
        if (!supportsAnsiColor) {
            return String(str);
        }
        return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m';
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

    function Logger(platform) {
        this.platform = platform;
    }

    Logger.prototype.log = function() {
        this.callNative('Sdk', 'logDebug', [Array.prototype.slice.call(arguments).join(' ')]);
    };

    Logger.prototype.error = function() {
        this.callNative('Sdk', 'logError', [Array.prototype.slice.call(arguments).join(' ')]);
    };

    Logger.prototype.callNative = function(className, methodName, parameters) {
        if(this.platform === 'android') {
            window.webviewbridge.handleInvocation(JSON.stringify([['com.unity3d.services.core.api.' + className, methodName, parameters, 'null']]));
        } else if(this.platform === 'ios') {
            if (window.webkit) {
                window.webkit.messageHandlers.handleInvocation.postMessage(JSON.stringify([['USRVApi' + className, methodName, parameters, 'null']]));
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://webviewbridge.unityads.unity3d.com/handleInvocation', false);
                xhr.send(JSON.stringify([['USRVApi' + className, methodName, parameters, 'null']]));
            }
        } else {
            console.log(parameters[0]);
        }
    };

    function Base(runner) {
        var stats = (this.stats = {
            suites: 0,
            tests: 0,
            passes: 0,
            pending: 0,
            failures: 0
        });
        var failures = (this.failures = []);

        if (!runner) {
            return;
        }
        this.logger = new Logger(getPlatform());

        runner.stats = stats;

        runner.on('start', function() {
            stats.start = new Date();
        });

        runner.on('suite', function(suite) {
            stats.suites = stats.suites || 0;
            suite.root || stats.suites++;
        });

        runner.on('test end', function() {
            stats.tests = stats.tests || 0;
            stats.tests++;
        });

        runner.on('pass', function(test) {
            stats.passes = stats.passes || 0;

            if (test.duration > test.slow()) {
                test.speed = 'slow';
            } else if (test.duration > test.slow() / 2) {
                test.speed = 'medium';
            } else {
                test.speed = 'fast';
            }

            stats.passes++;
        });

        runner.on('fail', function(test, err) {
            stats.failures = stats.failures || 0;
            stats.failures++;
            test.err = err;
            failures.push(test);
        });

        runner.once('end', function() {
            stats.end = new Date();
            stats.duration = stats.end - stats.start;
        });

        runner.on('pending', function() {
            stats.pending++;
        });
    }

    Base.prototype.epilogue = function() {
        var stats = this.stats;
        this.logger.log('');

        // passes
        var duration = '(' + format(stats.duration) + ')';
        this.logger.log(color('green', (stats.passes || 0) + ' passing'), color('light', duration));
        // pending
        if (stats.pending) {
            this.logger.log(color('pending', stats.pending + ' pending'));
        }

        // failures
        if (stats.failures) {
            this.logger.error(color('fail', stats.failures + ' failing'));
            this.listFailures(this.failures);
            this.logger.error('');
        }

        this.logger.log('');
    };

    Base.prototype.listFailures = function() {
        var failures = this.failures;
        var logger = this.logger;
        failures.forEach(function(test, i) {
            // msg
            var msg;
            var err = test.err;
            var message;
            if (err.message && typeof err.message.toString === 'function') {
                message = err.message + '';
            } else if (typeof err.inspect === 'function') {
                message = err.inspect() + '';
            } else {
                message = '';
            }
            var stack = err.stack || message;
            var index = message ? stack.indexOf(message) : -1;

            if (index === -1) {
                msg = message;
            } else {
                index += message.length;
                msg = stack.slice(0, index);
                // remove msg from stack
                stack = stack.slice(index + 1);
            }

            // uncaught
            if (err.uncaught) {
                msg = 'Uncaught ' + msg;
            }

            // indent stack trace
            stack = stack.replace(/^/gm, '  ');

            // indented test title
            var testTitle = '';
            test.titlePath().forEach(function(str, index) {
                if (index !== 0) {
                    testTitle += '\n     ';
                }
                for (var i = 0; i < index; i++) {
                    testTitle += '  ';
                }
                testTitle += str;
            });

            var errorTitle = ' ' + (i + 1) + ') ' + testTitle + ':';
            logger.error('');
            logger.error(color('error title', errorTitle));
            logger.error(color('error message', '     ' + msg));
            logger.error(color('error stack', stack));
        });
    };

    function Spec(runner) {
        Base.call(this, runner);

        var self = this;
        var indents = 0;

        function indent() {
            return Array(indents).join('  ');
        }

        runner.on('start', function() {
            self.logger.log('');
        });

        runner.on('suite', function(suite) {
            ++indents;
            self.logger.log(indent(), color('suite', suite.title));
        });

        runner.on('suite end', function() {
            --indents;
            if (indents === 1) {
                self.logger.log('');
            }
        });

        runner.on('pending', function(test) {
            test.title = 'pending: ' + test.title;
            self.logger.log(indent(), color('pending', test.title));
        });

        runner.on('pass', function(test) {
            test.title = 'passed: ' + test.title;
            var glyph = color('checkmark', '  ' + symbols.ok);
            if (test.speed === 'fast') {
                self.logger.log(indent(), glyph,  color('pass', test.title));
            } else {
                var duration = '(' + test.duration + 'ms)';
                self.logger.log(indent(), glyph,  color('pass', test.title), color(test.speed, duration));
            }
        });

        runner.on('fail', function(test) {
            test.title = 'failed: ' + test.title;
            var glyph = color('fail', '  ' + symbols.err);
            self.logger.error(indent(), glyph, color('fail', test.title));
        });

        runner.once('end', self.epilogue.bind(self));
    }

    Spec.prototype = Base.prototype;

    return Spec;
}());
