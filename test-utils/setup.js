mocha.setup({
    ui: 'bdd',
    checkLeaks: true,
    fullTrace: true,
    reporter: HybridTestReporter,
    globals: ['nativebridge', 'webviewbridge', 'webview', 'requestAnimationFrame', 'cancelAnimationFrame']
});
