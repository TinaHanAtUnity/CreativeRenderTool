import { Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
export class IosUtils {
    static isAppSheetBroken(osVersion, model, orientation) {
        if ((model.match(/iphone/i) || model.match(/ipod/i)) && orientation === Orientation.LANDSCAPE) {
            return true; //iPhone + Landscape = crash
        }
        else if (osVersion.match(/^8\.[0-4]/)) {
            return true; //iOS 8 not supported
        }
        else if (osVersion.match(/^7\.[0-9]/)) {
            return true; //iOS 7 not supported
        }
        else if (osVersion.match(/^13\.[0-9]/)) {
            return true; //iOS 13 disabled. TODO: Allow iOS 13 in SDK 3.3+
        }
        else {
            return false;
        }
    }
    /**
     * Store API functionality is broken on osVersion 11.1 and below
     */
    static isStoreApiBroken(osVersion) {
        const osVersionSplit = osVersion ? osVersion.split('.') : '';
        if (osVersionSplit.length >= 2) {
            const majorOsVersion = +osVersionSplit[0];
            const minorOsVersion = +osVersionSplit[1];
            if (!isNaN(majorOsVersion) && !isNaN(minorOsVersion)) {
                if (majorOsVersion >= 12) {
                    return false;
                }
                else if (majorOsVersion === 11 && minorOsVersion >= 2) {
                    return false;
                }
            }
        }
        return true;
    }
    static isAdUnitTransparencyBroken(osVersion) {
        if (osVersion.match(/^13\./)) {
            return true;
        }
        else {
            return false;
        }
    }
    static hasVideoStallingApi(osVersion) {
        if (osVersion.match(/^1/)) {
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW9zVXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQWRzL1V0aWxpdGllcy9Jb3NVdGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sd0NBQXdDLENBQUM7QUFFckUsTUFBTSxPQUFPLFFBQVE7SUFFVixNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBaUIsRUFBRSxLQUFhLEVBQUUsV0FBd0I7UUFDckYsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLFdBQVcsS0FBSyxXQUFXLENBQUMsU0FBUyxFQUFFO1lBQzNGLE9BQU8sSUFBSSxDQUFDLENBQUMsNEJBQTRCO1NBQzVDO2FBQU0sSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLENBQUMscUJBQXFCO1NBQ3JDO2FBQU0sSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLFdBQVcsQ0FBQyxFQUFFO1lBQ3JDLE9BQU8sSUFBSSxDQUFDLENBQUMscUJBQXFCO1NBQ3JDO2FBQU0sSUFBSSxTQUFTLENBQUMsS0FBSyxDQUFDLFlBQVksQ0FBQyxFQUFFO1lBQ3RDLE9BQU8sSUFBSSxDQUFDLENBQUMsaURBQWlEO1NBQ2pFO2FBQU07WUFDSCxPQUFPLEtBQUssQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNJLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUE2QjtRQUV4RCxNQUFNLGNBQWMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM3RCxJQUFJLGNBQWMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBRTVCLE1BQU0sY0FBYyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU0sY0FBYyxHQUFHLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBRTFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLEVBQUU7Z0JBQ2xELElBQUksY0FBYyxJQUFJLEVBQUUsRUFBRTtvQkFDdEIsT0FBTyxLQUFLLENBQUM7aUJBQ2hCO3FCQUFNLElBQUksY0FBYyxLQUFLLEVBQUUsSUFBSSxjQUFjLElBQUksQ0FBQyxFQUFFO29CQUNyRCxPQUFPLEtBQUssQ0FBQztpQkFDaEI7YUFDSjtTQUNKO1FBRUQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVNLE1BQU0sQ0FBQywwQkFBMEIsQ0FBQyxTQUFpQjtRQUN0RCxJQUFJLFNBQVMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEVBQUU7WUFDMUIsT0FBTyxJQUFJLENBQUM7U0FDZjthQUFNO1lBQ0gsT0FBTyxLQUFLLENBQUM7U0FDaEI7SUFDTCxDQUFDO0lBRU0sTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQWlCO1FBQy9DLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN2QixPQUFPLElBQUksQ0FBQztTQUNmO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztDQUNKIn0=