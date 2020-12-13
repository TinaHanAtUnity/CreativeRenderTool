/**
 * Can be used to replace static data in our markup prior to dom injection
 */
export class MacroUtil {
    static replaceMacro(src, map) {
        // @param {string} src The markup; @param {Object} map The data to replace
        Object.keys(map).forEach((macros) => {
            src = src.replace(macros, map[macros]);
        });
        return src;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWFjcm9VdGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvTWFjcm9VdGlsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBOztHQUVHO0FBQ0gsTUFBTSxPQUFPLFNBQVM7SUFDWCxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQVcsRUFBRSxHQUErQjtRQUNwRSwwRUFBMEU7UUFDekUsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNoQyxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDM0MsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEdBQUcsQ0FBQztJQUNmLENBQUM7Q0FDSiJ9