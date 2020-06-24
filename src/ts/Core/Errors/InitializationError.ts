import { InitErrorCode } from 'Core/Native/Sdk';

export class InitializationError extends Error {

    public readonly tag: InitErrorCode;

    constructor(message: string, tag: InitErrorCode) {
        super(message);
        this.tag = tag;
    }
}
