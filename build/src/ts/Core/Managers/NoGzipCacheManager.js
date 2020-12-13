import { CacheManager } from 'Core/Managers/CacheManager';
export class NoGzipCacheManager extends CacheManager {
    getHeaders(fileInfo) {
        const headers = super.getHeaders(fileInfo);
        headers.push(['Accept-Encoding', 'identity']);
        return headers;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTm9HemlwQ2FjaGVNYW5hZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvTWFuYWdlcnMvTm9HemlwQ2FjaGVNYW5hZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQWUsTUFBTSw0QkFBNEIsQ0FBQztBQUd2RSxNQUFNLE9BQU8sa0JBQW1CLFNBQVEsWUFBWTtJQUN0QyxVQUFVLENBQUMsUUFBK0I7UUFDaEQsTUFBTSxPQUFPLEdBQWdCLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDeEQsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLGlCQUFpQixFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7UUFDOUMsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztDQUNKIn0=