import { InitErrorCode } from 'Core/Native/Sdk';

export class InitializationError extends Error {

    public readonly tag: {errorCode: InitErrorCode; rsn: string};

    constructor(tag: { errorCode:InitErrorCode; rsn: string },  message: string | undefined) {
        super(message);
        this.tag = tag;
    }
}
