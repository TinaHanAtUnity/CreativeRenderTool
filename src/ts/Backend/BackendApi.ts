import { Backend } from 'Backend/Backend';

export abstract class BackendApi {

    protected _backend: Backend;

    constructor(backend: Backend) {
        this._backend = backend;
    }

}
