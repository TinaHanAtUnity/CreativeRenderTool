import { WebViewError } from 'Common/Errors/WebViewError';

export class DiagnosticError extends WebViewError {

    public diagnostic: { [id: string]: any } = {};
    public stack?: string;

    constructor(error: Error, diagnosticData: { [id: string]: any }) {
        super(error.message, error.name);
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }

}
