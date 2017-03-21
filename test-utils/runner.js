Promise.all({TEST_LIST}.map(function(testPath) {
    return System.import(testPath);
})).then(function() {
    window.runner.run(function(failures) {
        var platform = (function() {
            var queryString = window.location.search.split('?')[1].split('&');
            for(var i = 0; i < queryString.length; i++) {
                var queryParam = queryString[i].split('=');
                if(queryParam[0] === 'platform') {
                    return queryParam[1];
                }
            }
            return undefined;
        })();
        if(platform === 'android') {
            window.webviewbridge.handleInvocation(JSON.stringify([['com.unity3d.ads.test.hybrid.HybridTest', 'onTestResult', [failures], 'null']]));
        } else if(platform === 'ios') {
            if(window.webkit) {
                window.webkit.messageHandlers.handleInvocation.postMessage(JSON.stringify([['UADSHybridTest', 'onTestResult', [failures], 'null']]));
            } else {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://webviewbridge.unityads.unity3d.com/handleInvocation', false);
                xhr.send(JSON.stringify([['UADSHybridTest', 'onTestResult', [failures], 'null']]));
            }
        }
    });
});

