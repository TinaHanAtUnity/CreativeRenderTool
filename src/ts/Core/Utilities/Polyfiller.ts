export class Polyfiller {
    public static getObjectValuesFunction(): (object: {}) => unknown[] {
        return (object: {}) => {
            return Object.keys(object).map((values) => object[<keyof typeof object>values]);
        };
    }
}
