process.on('unhandledRejection', function(reason, promise) {
    console.error('Unhandled promise rejection:');
    console.dir(reason);
});
