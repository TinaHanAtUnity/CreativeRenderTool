import { TestApi } from './TestApi';

export class Cache extends TestApi {

    private static _cacheQueue: string[] = [];
    private static _cache: { [key: string]: string } = {};

    public download(url: string, overwrite: boolean): any[] {
        if(Cache._cacheQueue.some(cacheUrl => cacheUrl === url)) {
            return ['ERROR', 'FILE_ALREADY_IN_QUEUE', url];
        } else if(url in Cache._cache) {
            return ['ERROR', 'FILE_ALREADY_IN_CACHE', url];
        } else {
            Cache._cacheQueue.push(url);
            setTimeout(() => {
                Cache._cacheQueue = Cache._cacheQueue.filter(cacheUrl => cacheUrl !== url);
                Cache._cache[url] = url.replace('http', 'file');
                this.getNativeBridge().handleEvent(['CACHE_DOWNLOAD_END', url]);
            }, 0);
            return ['OK'];
        }
    }

    public getFileUrl(url: string): any[] {
        if(url in Cache._cache) {
            return ['OK', Cache._cache[url]];
        } else {
            return ['ERROR', 'FILE_NOT_FOUND'];
        }
    }

}