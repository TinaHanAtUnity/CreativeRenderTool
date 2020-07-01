import { InitializationError } from 'Core/Errors/InitializationError';
import { InitErrorCode } from 'Core/Native/Sdk';

export class ConfigError extends InitializationError {

    constructor(error: Error) {
        super(error.message, InitErrorCode.ConfigurationError);
    }
}
