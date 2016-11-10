import { INativeResponse } from 'Utilities/Request';
export class RequestError extends Error {

    public nativeResponse?: INativeResponse;
    public nativeRequest: any;

    constructor(error: Error, nativeRequest: any, nativeResponse?: INativeResponse) {
        super();

        this.name = error.name;
        this.message = error.message;
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
    }
}
