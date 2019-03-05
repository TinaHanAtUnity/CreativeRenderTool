
export class StringUtl {

    private static _htmlOpenTag: RegExp = /<\w+>/;
    private static _htmlCloseTag: RegExp = /<\/\w+>/;
    // </charcters/> ... <//characters/>
    public static isHTML(markup: string): boolean {
        const checkResult = this._htmlOpenTag.exec(markup);
        if (checkResult) {
            return checkResult.index === 0;
        }
        return false;
    }
}
