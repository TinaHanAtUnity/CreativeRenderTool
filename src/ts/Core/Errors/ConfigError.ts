import { InitializationError } from 'Core/Errors/InitializationError';
import { InitErrorCode } from 'Core/Native/Sdk';

export class ConfigError extends InitializationError {

    constructor(error: Error) {
        super({ errorCode: InitErrorCode.ConfigurationError, rsn: 'Unity Ads SDK fail to initialize due to configuration error' }, error.message);
    }
}
