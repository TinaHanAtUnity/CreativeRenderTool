import { ColorUtils } from 'MabExperimentation/Utilities/ColorUtils.ts';
import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
describe('ColorUtils', () => {
    describe(`returns true if the color starts with DARK, false if it doesn't, undefined if it's undefined`, () => {
        Object.entries(EndScreenExperimentDeclaration.color).forEach(([name, colorCode]) => {
            if (colorCode !== undefined) {
                it(`${name}:${colorCode}`, () => {
                    expect(ColorUtils.isDarkSchemeColor(colorCode)).toEqual(name.startsWith('DARK'));
                });
            }
            else {
                it(`${name}:${colorCode}`, () => {
                    expect(ColorUtils.isDarkSchemeColor(colorCode)).toEqual(undefined);
                });
            }
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JVdGlscy5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01hYkV4cGVyaW1lbnRhdGlvbi9VdGlsaXRpZXMvQ29sb3JVdGlscy5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSw0Q0FBNEMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsOEJBQThCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUVwRyxRQUFRLENBQUMsWUFBWSxFQUFFLEdBQUcsRUFBRTtJQUN4QixRQUFRLENBQUMsOEZBQThGLEVBQUUsR0FBRyxFQUFFO1FBQzFHLE1BQU0sQ0FBQyxPQUFPLENBQUMsOEJBQThCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRTtZQUMvRSxJQUFJLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3pCLEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUU7b0JBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO2dCQUNyRixDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILEVBQUUsQ0FBQyxHQUFHLElBQUksSUFBSSxTQUFTLEVBQUUsRUFBRSxHQUFHLEVBQUU7b0JBQzVCLE1BQU0sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==