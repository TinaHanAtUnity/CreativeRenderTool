import { DiagnosticError } from 'Core/Errors/DiagnosticError';

export class JsonParser {

    public static parse<T extends { [key: string]: unknown }>(text: string, reviver?: (key: unknown, value: unknown) => unknown): T {
        try {
            return JSON.parse(text, reviver);
        } catch (e) {
            throw new DiagnosticError(e, { json: text });
        }

    }
}
