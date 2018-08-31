import { DiagnosticError } from 'Common/Errors/DiagnosticError';

export class JsonParser {

    public static parse(text: string, reviver?: (key: any, value: any) => any): any {
        try {
            return JSON.parse(text, reviver);
        } catch(e) {
            throw new DiagnosticError(e, { json: text });
        }

    }
}
