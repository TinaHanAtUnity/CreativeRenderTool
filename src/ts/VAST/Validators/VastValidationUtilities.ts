
export class VastValidationUtilities {

    public static invalidUrlError(description: string, url: string): Error {
        return new Error(`VAST ${description} contains invalid url("${url}")`);
    }

    public static formatErrors(errors: Error[]): string {
        return errors.map((error) => {
            return error.message;
        }).join('\n    ');
    }

}
