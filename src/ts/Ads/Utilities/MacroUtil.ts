export class MacroUtil {
    public static replaceMacro(src: string, macro: string, map: {[macros: string]: string}): string {
        Object.keys(map).forEach((macros) => {
            src.replace(map[macros], macro);
        });
        return src;
    }
}
