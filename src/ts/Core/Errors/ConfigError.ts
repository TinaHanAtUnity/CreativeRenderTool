import { InitializationError } from 'Core/Errors/InitializationError';
import { InitErrorCode } from 'Core/Native/Sdk';

export class ConfigError extends InitializationError {

    constructor(error: InitializationError) {
        super(error.message, InitErrorCode.ConfigurationError);
    }
}
