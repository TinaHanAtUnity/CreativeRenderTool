define({TEST_LIST}, function() {
    mocha.run(function(failures) {
        window.webviewbridge.handleInvocation(JSON.stringify([['com.unity3d.ads.test.hybrid.HybridTest', 'testResult', [failures], "null"]]));
    });
});