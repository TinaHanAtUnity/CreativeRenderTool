export class WebViewError {

    public message?: string;
    public name?: string;

    constructor(message?: string, name?: string) {
        this.message = message;
        this.name = name;
    }
}
