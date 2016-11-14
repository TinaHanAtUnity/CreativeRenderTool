export class ConfigError extends Error {

    constructor(error: Error) {
        super();
        this.name = error.name;
        this.message = error.message;
    }
}
