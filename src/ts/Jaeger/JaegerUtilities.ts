export class JaegerUtilities {
    public static genTimestamp(): number {
        return Date.now() * 1000;
    }

    public static stripQueryAndFragment(url: string): string {
        return url.split(/[?#]/)[0];
    }

    // https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    // this should not be done over the native bridge else we end up with delay added to all network requests.
    public static uuidv4(): string {
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
    }
}
