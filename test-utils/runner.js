define({TEST_LIST}, function() {
    mocha.run(function(failures) {
        window.webviewbridge.handleInvocation('com.unity3d.ads.test.hybrid.HybridTest', 'testResult', JSON.stringify([failures]), null);
    });
});