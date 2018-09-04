import { WebViewError } from 'Core/Errors/WebViewError';

export class ConfigError extends WebViewError {

    constructor(error: Error) {
        super(error.message, error.name);
    }
}
