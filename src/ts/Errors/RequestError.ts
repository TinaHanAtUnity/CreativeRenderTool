import { INativeResponse } from 'Utilities/Request';
import { WebViewError } from 'Errors/WebViewError';

export class RequestError extends WebViewError {

    public nativeResponse?: INativeResponse;
    public nativeRequest: any;

    constructor(message: string, nativeRequest: any, nativeResponse?: INativeResponse) {
        super(message);
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
    }
}
