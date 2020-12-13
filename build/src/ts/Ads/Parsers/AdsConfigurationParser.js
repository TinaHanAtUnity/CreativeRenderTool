import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Placement } from 'Ads/Models/Placement';
import { CacheMode } from 'Core/Models/CoreConfiguration';
export class AdsConfigurationParser {
    static setTestHasArPlacement(hasArPlacement) {
        this._hasArPlacement = hasArPlacement;
    }
    static setIsBrowserBuild(isBrowserBuild) {
        this._isBrowserBuild = isBrowserBuild;
    }
    static parse(configJson) {
        const configPlacements = configJson.placements;
        const placements = {};
        let defaultPlacement;
        let defaultBannerPlacement;
        let hasArPlacement = false;
        if (configPlacements) {
            configPlacements.forEach(rawPlacement => {
                const placement = new Placement(rawPlacement);
                placements[placement.getId()] = placement;
                if (placement.isDefault()) {
                    if (placement.isBannerPlacement()) {
                        defaultBannerPlacement = placement;
                    }
                    else {
                        defaultPlacement = placement;
                    }
                }
                const adTypes = placement.getAdTypes();
                if (adTypes && adTypes.includes('MRAID_AR')) {
                    hasArPlacement = true;
                }
            });
        }
        else {
            throw Error('No placements in configuration response');
        }
        if (!defaultPlacement) {
            throw Error('No default placement in configuration response');
        }
        // Browser Build Testing Requires CacheMode to be Disabled
        const cacheMode = this._isBrowserBuild ? CacheMode.DISABLED : this.parseCacheMode(configJson);
        hasArPlacement = this._hasArPlacement ? true : hasArPlacement;
        const loadV5Enabled = configJson.loadV5Enabled ? configJson.loadV5Enabled : false;
        const configurationParams = {
            cacheMode: cacheMode,
            placements: placements,
            defaultPlacement: defaultPlacement,
            defaultBannerPlacement: defaultBannerPlacement,
            hidePrivacy: configJson.hidePrivacy,
            hasArPlacement: hasArPlacement,
            loadV5Enabled: loadV5Enabled
        };
        return new AdsConfiguration(configurationParams);
    }
    static parseCacheMode(configJson) {
        switch (configJson.assetCaching) {
            case 'forced':
                return CacheMode.FORCED;
            case 'allowed':
                return CacheMode.ALLOWED;
            case 'disabled':
                return CacheMode.DISABLED;
            default:
                throw new Error('Unknown assetCaching value "' + configJson.assetCaching + '"');
        }
    }
}
AdsConfigurationParser._isBrowserBuild = false;
AdsConfigurationParser._hasArPlacement = false;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzQ29uZmlndXJhdGlvblBhcnNlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvUGFyc2Vycy9BZHNDb25maWd1cmF0aW9uUGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBMkMsTUFBTSw2QkFBNkIsQ0FBQztBQUN4RyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDakQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBRTFELE1BQU0sT0FBTyxzQkFBc0I7SUFJeEIsTUFBTSxDQUFDLHFCQUFxQixDQUFDLGNBQXVCO1FBQ3ZELElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQzFDLENBQUM7SUFFTSxNQUFNLENBQUMsaUJBQWlCLENBQUMsY0FBdUI7UUFDbkQsSUFBSSxDQUFDLGVBQWUsR0FBRyxjQUFjLENBQUM7SUFDMUMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxLQUFLLENBQUMsVUFBZ0M7UUFDaEQsTUFBTSxnQkFBZ0IsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDO1FBQy9DLE1BQU0sVUFBVSxHQUFnQyxFQUFFLENBQUM7UUFDbkQsSUFBSSxnQkFBdUMsQ0FBQztRQUM1QyxJQUFJLHNCQUE2QyxDQUFDO1FBQ2xELElBQUksY0FBYyxHQUFZLEtBQUssQ0FBQztRQUVwQyxJQUFJLGdCQUFnQixFQUFFO1lBQ2xCLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRTtnQkFDcEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7Z0JBQzlDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUM7Z0JBQzFDLElBQUksU0FBUyxDQUFDLFNBQVMsRUFBRSxFQUFFO29CQUN2QixJQUFJLFNBQVMsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFO3dCQUMvQixzQkFBc0IsR0FBRyxTQUFTLENBQUM7cUJBQ3RDO3lCQUFNO3dCQUNILGdCQUFnQixHQUFHLFNBQVMsQ0FBQztxQkFDaEM7aUJBQ0o7Z0JBRUQsTUFBTSxPQUFPLEdBQUcsU0FBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUN2QyxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFO29CQUN6QyxjQUFjLEdBQUcsSUFBSSxDQUFDO2lCQUN6QjtZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILE1BQU0sS0FBSyxDQUFDLHlDQUF5QyxDQUFDLENBQUM7U0FDMUQ7UUFFRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUU7WUFDbkIsTUFBTSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztTQUNqRTtRQUVELDBEQUEwRDtRQUMxRCxNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzlGLGNBQWMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQztRQUU5RCxNQUFNLGFBQWEsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFbEYsTUFBTSxtQkFBbUIsR0FBc0I7WUFDM0MsU0FBUyxFQUFFLFNBQVM7WUFDcEIsVUFBVSxFQUFFLFVBQVU7WUFDdEIsZ0JBQWdCLEVBQUUsZ0JBQWdCO1lBQ2xDLHNCQUFzQixFQUFFLHNCQUFzQjtZQUM5QyxXQUFXLEVBQUUsVUFBVSxDQUFDLFdBQVc7WUFDbkMsY0FBYyxFQUFFLGNBQWM7WUFDOUIsYUFBYSxFQUFFLGFBQWE7U0FDL0IsQ0FBQztRQUVGLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ3JELENBQUM7SUFFTyxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQWdDO1FBQzFELFFBQVEsVUFBVSxDQUFDLFlBQVksRUFBRTtZQUM3QixLQUFLLFFBQVE7Z0JBQ1QsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDO1lBQzVCLEtBQUssU0FBUztnQkFDVixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUM7WUFDN0IsS0FBSyxVQUFVO2dCQUNYLE9BQU8sU0FBUyxDQUFDLFFBQVEsQ0FBQztZQUM5QjtnQkFDSSxNQUFNLElBQUksS0FBSyxDQUFDLDhCQUE4QixHQUFHLFVBQVUsQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLENBQUM7U0FDdkY7SUFDTCxDQUFDOztBQXpFYyxzQ0FBZSxHQUFZLEtBQUssQ0FBQztBQUNqQyxzQ0FBZSxHQUFZLEtBQUssQ0FBQyJ9