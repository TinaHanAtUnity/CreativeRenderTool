import { BackendApi } from '../BackendApi';

export class AppSheet extends BackendApi {

    public canOpen() {
        return false;
    }

    public prepare(options: any, timeout: number) {
        return;
    }

    public destroy(options: any) {
        return;
    }

}
