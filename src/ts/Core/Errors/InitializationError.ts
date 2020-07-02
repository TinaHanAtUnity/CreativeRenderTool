import { InitErrorCode } from 'Core/Native/Sdk';

export class InitializationError extends Error {

    public readonly errorCode: InitErrorCode;

    constructor(errorCode: InitErrorCode, message: string) {
        super(message);
        this.errorCode = errorCode;
    }
}
