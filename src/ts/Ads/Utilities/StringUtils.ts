
export class StringUtils {

    private static _htmlOpenTag: RegExp = /<[^>]*>/;
    // </charcters/> ... <//characters/>
    public static startWithHTMLTag(markup: string): boolean {
        const checkResult = this._htmlOpenTag.exec(markup);
        if (checkResult) {
            return checkResult.index === 0;
        }
        return false;
    }
}
