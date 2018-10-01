import { WebViewError } from 'Core/Errors/WebViewError';
import { INativeResponse } from 'Core/Utilities/Request';

export class RequestError extends WebViewError {

    public nativeResponse?: INativeResponse;
    public nativeRequest: unknown;

    constructor(message: string, nativeRequest: unknown, nativeResponse?: INativeResponse) {
        super(message);
        this.nativeRequest = nativeRequest;
        this.nativeResponse = nativeResponse;
    }
}
