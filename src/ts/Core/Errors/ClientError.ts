import { WebViewError } from 'Core/Errors/WebViewError';

export class ClientError extends WebViewError {

    public responseCode: number;

    constructor(message: string, responseCode: number) {
        super(message);
        this.responseCode = responseCode;
    }
}
