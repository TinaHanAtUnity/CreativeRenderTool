// To look for the string in src and replace with the value in map
export class MacroUtil {
    public static replaceMacro(src: string, map: {[macros: string]: string}): string {
        Object.keys(map).forEach((macros) => {
            src = src.replace(macros, map[macros]);
        });
        return src;
    }
}
