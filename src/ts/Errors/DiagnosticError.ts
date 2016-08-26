export class DiagnosticError extends Error {

    public diagnostic: { [id: string]: string} = {};

    constructor(error: Error, diagnosticData: { [id: string]: string}) {
        super();
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }

}
