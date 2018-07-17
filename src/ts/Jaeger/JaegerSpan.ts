import { JaegerUtilities } from 'Jaeger/JaegerUtilities';

interface IJaegerLocalEndpoint {
    readonly serviceName: string;
}
class JaegerLocalEndpoint implements IJaegerLocalEndpoint {
    public serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }
}

interface IJaegerAnnotation {
    readonly timestamp: number;
    readonly value: string;
}
class JaegerAnnotation implements IJaegerAnnotation {
    public timestamp: number = JaegerUtilities.genTimestamp();
    public value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export interface IJaegerSpan {
    readonly traceId: string;
    readonly name: string;
    readonly parentId?: string;
    readonly id: string;
    readonly kind: string;
    readonly timestamp: number;
    readonly duration: number;
    readonly debug: boolean;
    readonly shared: boolean;
    readonly localEndpoint: IJaegerLocalEndpoint;
    readonly annotations: IJaegerAnnotation[];
    readonly tags: { [key: string]: string };

    stop(): void;
}

export enum JaegerTags {
    StatusCode = 'status.code',
    DeviceType = 'device.type',
    Error = 'error',
    ErrorMessage = 'error.message'
}

export class JaegerSpan implements IJaegerSpan {

    public traceId: string = JaegerUtilities.uuidv4().substring(8, 24);
    public name: string;
    public id: string = JaegerUtilities.uuidv4().substring(8, 24);
    public parentId?: string;
    public kind: string = 'CLIENT';
    public timestamp: number = JaegerUtilities.genTimestamp();
    public duration: number = 0;
    public debug: boolean = true;
    public shared: boolean = true;
    public localEndpoint: IJaegerLocalEndpoint = new JaegerLocalEndpoint('ads-sdk');
    public annotations: IJaegerAnnotation[] = [];
    public tags: { [key: string]: string } = {};

    constructor(operation: string, parentId?: string, traceId?: string) {
        if (parentId) {
            this.parentId = parentId;
        }
        if (traceId) {
            this.traceId = traceId;
        }
        this.name = JaegerUtilities.stripQueryAndFragment(operation);
    }

    public addTag(key: JaegerTags, value: string) {
        this.tags[key] = value;
    }

    public addAnnotation(value: string) {
        const annotation = new JaegerAnnotation(value);
        this.annotations.push(annotation);
    }

    public stop() {
        this.duration = JaegerUtilities.genTimestamp() - this.timestamp;
    }

}
