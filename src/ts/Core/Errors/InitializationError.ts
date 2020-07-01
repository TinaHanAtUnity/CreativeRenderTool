import { InitErrorCode } from 'Core/Native/Sdk';

interface IInitializationErrorObject {
    errorCode: InitErrorCode;
    rsn: string;
}

export class InitializationError extends Error {

    public readonly tag: IInitializationErrorObject;

    constructor(tag: IInitializationErrorObject, message: string | undefined) {
        super(message);
        this.tag = tag;
    }
}
