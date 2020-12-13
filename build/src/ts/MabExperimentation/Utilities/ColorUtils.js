import { EndScreenExperimentDeclaration } from 'MabExperimentation/Models/AutomatedExperimentsList';
export class ColorUtils {
    static isDarkSchemeColor(color) {
        const colorKeyName = Object.keys(EndScreenExperimentDeclaration.color).find((key) => EndScreenExperimentDeclaration.color[key] === color);
        if (colorKeyName && colorKeyName.startsWith('UNDEFINED')) {
            return undefined;
        }
        else if (colorKeyName && colorKeyName.startsWith('DARK')) {
            return true;
        }
        else {
            return false;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29sb3JVdGlscy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9NYWJFeHBlcmltZW50YXRpb24vVXRpbGl0aWVzL0NvbG9yVXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLDhCQUE4QixFQUFFLE1BQU0sb0RBQW9ELENBQUM7QUFFcEcsTUFBTSxPQUFPLFVBQVU7SUFDWixNQUFNLENBQUMsaUJBQWlCLENBQUMsS0FBeUI7UUFDckQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyw4QkFBOEIsQ0FBQyxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLDhCQUE4QixDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsS0FBSyxLQUFLLENBQUMsQ0FBQztRQUUxSSxJQUFJLFlBQVksSUFBSSxZQUFZLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3RELE9BQU8sU0FBUyxDQUFDO1NBQ3BCO2FBQU0sSUFBSSxZQUFZLElBQUksWUFBWSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN4RCxPQUFPLElBQUksQ0FBQztTQUNmO2FBQU07WUFDSCxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7Q0FDSiJ9