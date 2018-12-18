import { BackendApi } from 'Backend/BackendApi';

export class AppSheet extends BackendApi {

    public canOpen() {
        return false;
    }

    public prepare(options: unknown, timeout: number) {
        return;
    }

    public destroy(options: unknown) {
        return;
    }

}
