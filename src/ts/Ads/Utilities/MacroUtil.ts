export class MacroUtil {
    public static replaceMacro(src: string, map: {[macros: string]: string}): string {
        Object.keys(map).forEach((macros) => {
            src = src.replace(macros, map[macros]);
        });
        return src;
    }
}
