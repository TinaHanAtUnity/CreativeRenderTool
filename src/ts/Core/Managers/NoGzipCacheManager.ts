import { CacheManager, HeadersType } from 'Core/Managers/CacheManager';
import { IFileInfo } from 'Core/Native/Cache';

export class NoGzipCacheManager extends CacheManager {
    protected getHeaders(fileInfo: IFileInfo | undefined): HeadersType {
        const headers: HeadersType = super.getHeaders(fileInfo);
        headers.push(['Accept-Encoding', 'identity']);
        return headers;
    }
}
