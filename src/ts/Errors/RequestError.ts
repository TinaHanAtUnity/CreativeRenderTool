import { INativeResponse } from 'Utilities/Request';
export class RequestError extends Error {

    public nativeResponse: INativeResponse;

    constructor(error: Error, nativeResponse: INativeResponse) {
        super();

        this.name = error.name;
        this.message = error.message;
        this.nativeResponse = nativeResponse;
    }
}
