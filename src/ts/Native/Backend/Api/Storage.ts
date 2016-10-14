export class Storage {

    public static get(storage: string, key: string) {
        throw ['COULDNT_GET_VALUE', key];
    }
    
    public static set(storage: string, key: string, value: any) {
        
    }

    public static delete(storage: string, key: string) {

    }

    public static getKeys(storage: string, key: string, recursive: boolean) {
        return [];
    }
    
    public static write(storage: string) {
        
    }

}