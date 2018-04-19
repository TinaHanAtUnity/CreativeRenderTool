import { Platform } from 'Constants/Platform';

class JaegerLocalEndpoint {
    private serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }
}

export class JaegerTags {
    private deviceType: string;

    constructor(platform: Platform) {
        this.deviceType = this.getDescription(platform);
    }

    private getDescription(platform: Platform): string {
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
}

export class JaegerNetworkTags extends JaegerTags {
    private statusCode: string;

    constructor(platform: Platform, statusCode: string) {
        super(platform);
        this.statusCode = statusCode;
    }
}

class JaegerProcessTags extends JaegerTags {
    private errorMessage?: string;

    constructor(platform: Platform, errorMessage?: string) {
        super(platform);
        this.errorMessage = errorMessage;
    }
}

export class JaegerAnnotation {
    private timestamp: number = JaegerSpan.genTimestamp();
    private value: string;

    constructor(value: string) {
        this.value = value;
    }
}

export class JaegerSpan {

    public static genTimestamp(): number {
        return Date.now() * 1000;
    }

    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    // this should not be done over the native bridge else we end up with delay added to all network requests.
    private static uuidv4(): string {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }

    private traceId: string = JaegerSpan.uuidv4().substring(8, 24);
    private name: string;
    private id: string = JaegerSpan.uuidv4().substring(8, 24);
    private kind: string = 'CLIENT';
    private timestamp: number = JaegerSpan.genTimestamp();
    private duration: number = 0;
    private debug: boolean = true;
    private shared: boolean = true;
    private localEndpoint: JaegerLocalEndpoint;
    private annotations: JaegerAnnotation[] = [];
    private tags: JaegerTags = new JaegerTags(Platform.TEST);

    constructor(name: string, serviceName: string, annotations: JaegerAnnotation[]) {
        this.name = name;
        this.localEndpoint = new JaegerLocalEndpoint(serviceName);
        this.annotations = annotations;
    }

    public getTraceId(): string {
        return this.traceId;
    }

    public getId(): string {
        return this.id;
    }

    public stopNetwork(platform: Platform, responseCode: string) {
        const tags = new JaegerNetworkTags(platform, responseCode);
        this.tags = tags;
        this.duration = JaegerSpan.genTimestamp() - this.timestamp;
    }

    public stopProcess(platform: Platform, errorMessage?: string) {
        const tags = new JaegerProcessTags(platform, errorMessage);
        this.tags = tags;
        this.duration = JaegerSpan.genTimestamp() - this.timestamp;
    }

}
