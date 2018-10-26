import { BackendApi } from 'Backend/BackendApi';

export class Resolve extends BackendApi {

    public resolve(id: string, host: string): string {
        if(host.indexOf('fail') !== -1) {
            setTimeout(() => {
                this._backend.sendEvent('RESOLVE', 'FAILED', id, host, 'Error', 'Error message');
            }, 0);
        } else {
            setTimeout(() => {
                this._backend.sendEvent('RESOLVE', 'COMPLETE', id, host, '1.2.3.4');
            }, 0);
        }
        return id;
    }

}
