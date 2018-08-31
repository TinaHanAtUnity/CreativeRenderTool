import { WebViewError } from 'Common/Errors/WebViewError';

export class ConfigError extends WebViewError {

    constructor(error: Error) {
        super(error.message, error.name);
    }
}
