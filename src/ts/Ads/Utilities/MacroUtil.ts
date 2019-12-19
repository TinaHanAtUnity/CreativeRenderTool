
/**
 * Can be used to replace static data in our markup prior to dom injection
 */
export class MacroUtil {
    public static replaceMacro(src: string, map: {[macros: string]: string}): string {
       // @param {string} src The markup; @param {Object} map The data to replace
        Object.keys(map).forEach((macros) => {
            src = src.replace(macros, map[macros]);
        });
        return src;
    }
}
