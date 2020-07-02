import { InitErrorCode } from 'Core/Native/Sdk';

export class InitializationError extends Error {

    public readonly errorCode: InitErrorCode;

    constructor(message: string, errorCode: InitErrorCode) {
        super(message);
        this.errorCode = errorCode;
    }
}
