import { TestApi } from './TestApi';

export class Storage extends TestApi {

    public read(): any[] {
        return ['OK'];
    }

    public get(key: string): any[] {
        return ['OK', 'lol'];
    }

}