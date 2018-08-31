import { WebViewError } from 'Common/Errors/WebViewError';
import { INativeResponse } from 'Core/Utilities/Request';

export class RequestError extends WebViewError {

    public nativeResponse?: INativeResponse;
    public nativeRequest: any;

    constructor(message: string, nativeRequest: any, nativeResponse?: INativeResponse) {
        super(message);
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
    }
}
