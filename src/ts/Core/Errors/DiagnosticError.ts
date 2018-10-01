import { WebViewError } from 'Core/Errors/WebViewError';

export class DiagnosticError extends WebViewError {

    public diagnostic: { [id: string]: unknown } = {};
    public stack?: string;

    constructor(error: Error, diagnosticData: { [id: string]: unknown }) {
        super(error.message, error.name);
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }

}
