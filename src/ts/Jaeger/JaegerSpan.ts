import { Platform } from 'Constants/Platform';

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
    public timestamp: number = JaegerSpan.genTimestamp();
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
    readonly tags: any;

    stop(): void;
}

export enum JaegerTags {
    StatusCode = 'status.code',
    DeviceType = 'device.type',
    Error = 'error',
    ErrorMessage = 'error.message',
}

export class JaegerSpan implements IJaegerSpan {

    public static genTimestamp(): number {
        return Date.now() * 1000;
    }

    public static getPlatform(platform: Platform): string {
        switch(platform) {
            case Platform.ANDROID: {
                return 'ANDROID';
            }
            case Platform.IOS: {
                return 'IOS';
            }
            default: {
                return 'TEST';
            }
        }
    }

    public static stripQueryAndFragment(url: string): string {
        return url.split(/[?#]/)[0];
    }

    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    // this should not be done over the native bridge else we end up with delay added to all network requests.
    private static uuidv4(): string {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    public traceId: string = JaegerSpan.uuidv4().substring(8, 24);
    public name: string;
    public id: string = JaegerSpan.uuidv4().substring(8, 24);
    public parentId?: string;
    public kind: string = 'CLIENT';
    public timestamp: number = JaegerSpan.genTimestamp();
    public duration: number = 0;
    public debug: boolean = true;
    public shared: boolean = true;
    public localEndpoint: IJaegerLocalEndpoint = new JaegerLocalEndpoint('ads-sdk');
    public annotations: IJaegerAnnotation[] = [];
    public tags: any = {};

    constructor(operation: string, parentId?: string, traceId?: string) {
        if (parentId) {
            this.parentId = parentId;
        }
        if (traceId) {
            this.traceId = traceId;
        }
        this.name = JaegerSpan.stripQueryAndFragment(operation);
    }

    public addTag(key: JaegerTags, value: string) {
        this.tags[key] = value;
    }

    public addAnnotation(value: string) {
        const annotation = new JaegerAnnotation(value);
        this.annotations.push(annotation);
    }

    public stop() {
        this.duration = JaegerSpan.genTimestamp() - this.timestamp;
    }

}
