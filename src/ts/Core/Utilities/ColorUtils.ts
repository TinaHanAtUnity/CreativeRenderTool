import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';

export class ColorUtils {
    public static isDarkSchemeColor(color: string | undefined): boolean {
        const colorKeyName = Object.keys(EndScreenExperimentDeclaration.color).find((key) => EndScreenExperimentDeclaration.color[key] === color);

        if (colorKeyName && colorKeyName.startsWith('DARK')) {
            return true;
        } else {
            return false;
        }
    }
}
