export class JsonSyntaxError extends SyntaxError {
    public failingContent: string;
}

export class JsonParser {

    public static parse(text: string, reviver?: (key: any, value: any) => any): any {
        try {
            return JSON.parse(text, reviver);
        } catch(e) {
            let error = <JsonSyntaxError>e;
            error.failingContent = text;
            error.name = 'JsonSyntaxError';
            throw error;
        }

    }
}