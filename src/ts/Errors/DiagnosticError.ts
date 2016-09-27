export class DiagnosticError extends Error {

    public diagnostic: { [id: string]: any } = {};

    constructor(error: Error, diagnosticData: { [id: string]: any }) {
        super();
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }

}
