
export class StringUtil {

    private static _htmlOpenTag: RegExp = /<\w+>/;
    // </charcters/> ... <//characters/>
    public static startWithHTMLTag(markup: string): boolean {
        const checkResult = this._htmlOpenTag.exec(markup);
        if (checkResult) {
            return checkResult.index === 0;
        }
        return false;
    }
}
