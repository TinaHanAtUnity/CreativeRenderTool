import { DiagnosticError } from 'Core/Errors/DiagnosticError';

export class JsonParser {

    public static parse(text: string, reviver?: (key: unknown, value: unknown) => unknown): unknown {
        try {
            return JSON.parse(text, reviver);
        } catch(e) {
            throw new DiagnosticError(e, { json: text });
        }

    }
}
