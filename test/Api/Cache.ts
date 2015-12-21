export class Cache {

    private static _cacheQueue: string[] = [];

    public download(url: string, overwrite: boolean): any[] {
        if(Cache._cacheQueue.some(cacheUrl => cacheUrl === url)) {
            return ['ERROR', 'FILE_ALREADY_IN_QUEUE', url];
        } else {
            Cache._cacheQueue.push(url);
            setTimeout(() => {
                Cache._cacheQueue = Cache._cacheQueue.filter(cacheUrl => cacheUrl !== url);
                window['nativebridge'].handleEvent('CACHE_DOWNLOAD_END', url);
            }, 0);
            return ['OK'];
        }
    }

    public getFileUrl(url: string): any[] {
        return ['OK', url.replace('http', 'file')];
    }

}