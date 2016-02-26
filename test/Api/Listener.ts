import { TestApi } from './TestApi';

export class Listener extends TestApi {

    public sendReadyEvent(placement: string): any[] {
        return ['OK'];
    }

}