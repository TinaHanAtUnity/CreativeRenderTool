export class Cache {

    public static setProgressInterval() {}

    public static getFiles() {
        return [];
    }

    public static isCaching() {
        return false;
    }

    public static getHash(url: string) {
        let hash = 0;
        if(!url.length) {
            return hash.toString();
        }
        for(let i = 0; i < url.length; i++) {
            let char = url.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    }

    public static getFileInfo(fileId: string) {

    }

}