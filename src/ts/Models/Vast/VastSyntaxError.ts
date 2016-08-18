export class VastSyntaxError extends SyntaxError {
    public failingContent: string;
    public rootWrapperVast: string;
    public wrapperDepth: number;
    public stack: string;

    constructor (message: string, failingContent: any, wrapperDepth: number, stack?: string) {
        super();
        this.message = message;
        this.name = 'VastSyntaxError';
        this.failingContent = failingContent;
        this.wrapperDepth = wrapperDepth;

        if (stack) {
            this.stack = stack;
        }
    }

    public toKafkaFormat () {
        return {
            'message': this.message,
            'name': this.name,
            'stack': this.stack,
            'wrapperDepth': this.wrapperDepth,
            'failingContent': this.failingContent,
            'rootWrapperVast': this.rootWrapperVast
        };
    }
}