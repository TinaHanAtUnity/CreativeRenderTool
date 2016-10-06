if(!Function.prototype.bind) {
    Function.prototype.bind = function(oThis) {
        if (typeof this !== 'function') {
            // closest thing possible to the ECMAScript 5
            // internal IsCallable function
            throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');
        }

        var aArgs   = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP    = function() {},
            fBound  = function() {
                return fToBind.apply(this instanceof fNOP
                        ? this
                        : oThis,
                    aArgs.concat(Array.prototype.slice.call(arguments)));
            };

        if (this.prototype) {
            // native functions don't have a prototype
            fNOP.prototype = this.prototype;
        }
        fBound.prototype = new fNOP();

        return fBound;
    };
}

if(!Array.prototype.forEach) {
    Array.prototype.forEach = function(callback, thisArg) {
        if(typeof(callback) !== 'function') {
            throw new TypeError(callback + ' is not a function!');
        }
        var len = this.length;
        for(var i = 0; i < len; i++) {
            callback.call(thisArg, this[i], i, this);
        }
    };
}

if(!('classList' in document.documentElement) && Object.defineProperty && typeof HTMLElement !== 'undefined') {
    Object.defineProperty(HTMLElement.prototype, 'classList', {
        get: function() {
            var self = this;
            function update(fn) {
                return function(value) {
                    var classes = self.className.split(/\s+/), index = classes.indexOf(value);
                    fn(classes, index, value);
                    self.className = classes.join(' ');
                };
            }

            var ret = {
                add: update(function(classes, index, value) {
                    ~index || classes.push(value);
                }),

                remove: update(function(classes, index) {
                    ~index && classes.splice(index, 1);
                }),

                toggle: update(function(classes, index, value) {
                    ~index ? classes.splice(index, 1) : classes.push(value);
                }),

                contains: function(value) {
                    return !!~self.className.split(/\s+/).indexOf(value);
                },

                item: function(i) {
                    return self.className.split(/\s+/)[i] || null;
                }
            };

            Object.defineProperty(ret, 'length', {
                get: function() {
                    return self.className.split(/\s+/).length;
                }
            });

            return ret;
        }
    });
}

var getPlatform = function() {
    var queryString = window.location.search.split('?')[1].split('&');
    for(var i = 0; i < queryString.length; i++) {
        var queryParam = queryString[i].split('=');
        if(queryParam[0] === 'platform') {
            return queryParam[1];
        }
    }
    return undefined;
};

Promise.all({TEST_LIST}.map(function(testPath) {
    return System.import(testPath);
})).then(() => {
    window.runner.run(function(failures) {
        var platform = getPlatform();
        if(platform === 'android') {
            window.webviewbridge.handleInvocation(JSON.stringify([['com.unity3d.ads.test.hybrid.HybridTest', 'onTestResult', [failures], 'null']]));
        } else if(platform === 'ios') {
            var xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://webviewbridge.unityads.unity3d.com/handleInvocation', false);
            xhr.send(JSON.stringify([['UADSHybridTest', 'onTestResult', [failures], 'null']]));
        }
    });
});
