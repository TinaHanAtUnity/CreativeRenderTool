import { InitErrorCode } from 'Core/Native/Sdk';

interface InitializationErrorObject {
    errorCode: InitErrorCode;
    rsn: string;
}

export class InitializationError extends Error {

    public readonly tag: InitializationErrorObject;

    constructor(tag: InitializationErrorObject, message: string | undefined) {
        super(message);
        this.tag = tag;
    }
}
