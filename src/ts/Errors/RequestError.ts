export class RequestError extends Error {

    public responseCode: number;

    constructor(error: Error, responseCode: number) {
        super();
        this.name = error.name;
        this.message = error.message;
        this.responseCode = responseCode;
    }
}
