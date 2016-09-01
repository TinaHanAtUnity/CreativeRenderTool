export class DiagnosticError extends Error {

    public diagnostic: { [id: string]: string | number} = {};

    constructor(error: Error, diagnosticData: { [id: string]: string | number}) {
        super();
        this.name = error.name;
        this.message = error.message;
        this.stack = error.stack;
        this.diagnostic = diagnosticData;
    }

}
