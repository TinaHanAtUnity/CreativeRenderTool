import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement.ts';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
describe('AdsConfigurationTest', () => {
    let adsConfiguration;
    beforeEach(() => {
        const commonFields = {
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        };
        const placements = {
            'placement_1': new Placement(Object.assign({ id: 'placement_1', adUnitId: 'adUnitId_1', groupId: 'groupId_1' }, commonFields)),
            'placement_2': new Placement(Object.assign({ id: 'placement_2', adUnitId: 'adUnitId_1', groupId: 'groupId_1' }, commonFields)),
            'placement_3': new Placement(Object.assign({ id: 'placement_3', adUnitId: 'adUnitId_1', groupId: 'groupId_1' }, commonFields)),
            'placement_4': new Placement(Object.assign({ id: 'placement_4', adUnitId: 'adUnitId_2', groupId: 'groupId_2' }, commonFields)),
            'placement_5': new Placement(Object.assign({ id: 'placement_5' }, commonFields)),
            'placement_6': new Placement(Object.assign({ id: 'placement_6', adUnitId: 'adUnitId_2', groupId: 'groupId_2' }, commonFields))
        };
        const configurationParams = {
            cacheMode: CacheMode.FORCED,
            placements: placements,
            defaultPlacement: placements.placement_1,
            defaultBannerPlacement: undefined,
            hidePrivacy: undefined,
            hasArPlacement: false,
            loadV5Enabled: false
        };
        adsConfiguration = new AdsConfiguration(configurationParams);
    });
    describe('normal behavior of getPlacementsForAdunit', () => {
        [
            { adUnitId: 'adUnitId_1', expectedPlacements: ['placement_1', 'placement_2', 'placement_3'] },
            { adUnitId: 'adUnitId_2', expectedPlacements: ['placement_4', 'placement_6'] },
            { adUnitId: 'unknown_adUnitId', expectedPlacements: [] }
        ].forEach(({ adUnitId, expectedPlacements }) => {
            it(`should return valid placements for ${adUnitId}`, () => {
                expect(adsConfiguration.getPlacementsForAdunit(adUnitId)).toEqual(expectedPlacements);
            });
        });
    });
    describe('normal behavior of getPlacementsForGroupId', () => {
        [
            { groupId: 'groupId_1', expectedPlacements: ['placement_1', 'placement_2', 'placement_3'] },
            { groupId: 'groupId_2', expectedPlacements: ['placement_4', 'placement_6'] },
            { groupId: 'unknown_groupId', expectedPlacements: [] }
        ].forEach(({ groupId, expectedPlacements }) => {
            it(`should return valid placements for ${groupId}`, () => {
                expect(adsConfiguration.getPlacementsForGroupId(groupId)).toEqual(expectedPlacements);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRzQ29uZmlndXJhdGlvbi5zcGVjLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9Nb2RlbHMvQWRzQ29uZmlndXJhdGlvbi5zcGVjLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUMxRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDcEQsT0FBTyxFQUFFLGdCQUFnQixFQUFxQixNQUFNLDZCQUE2QixDQUFDO0FBRWxGLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLEVBQUU7SUFDbEMsSUFBSSxnQkFBa0MsQ0FBQztJQUV2QyxVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osTUFBTSxZQUFZLEdBQUc7WUFDakIsSUFBSSxFQUFFLE1BQU07WUFDWixPQUFPLEVBQUUsSUFBSTtZQUNiLFNBQVMsRUFBRSxJQUFJO1lBQ2YsYUFBYSxFQUFFLENBQUM7WUFDaEIsaUJBQWlCLEVBQUUsSUFBSTtZQUN2Qiw0QkFBNEIsRUFBRSxLQUFLO1lBQ25DLGtCQUFrQixFQUFFLEtBQUs7WUFDekIsd0JBQXdCLEVBQUUsS0FBSztZQUMvQiw2QkFBNkIsRUFBRSxLQUFLO1lBQ3BDLE9BQU8sRUFBRSxFQUFFO1lBQ1gsWUFBWSxFQUFFLElBQUk7WUFDbEIsU0FBUyxFQUFFLEtBQUs7U0FDbkIsQ0FBQztRQUVGLE1BQU0sVUFBVSxHQUFHO1lBQ2YsYUFBYSxFQUFFLElBQUksU0FBUyxpQkFDeEIsRUFBRSxFQUFFLGFBQWEsRUFDakIsUUFBUSxFQUFFLFlBQVksRUFDdEIsT0FBTyxFQUFFLFdBQVcsSUFDakIsWUFBWSxFQUNqQjtZQUNGLGFBQWEsRUFBRSxJQUFJLFNBQVMsaUJBQ3hCLEVBQUUsRUFBRSxhQUFhLEVBQ2pCLFFBQVEsRUFBRSxZQUFZLEVBQ3RCLE9BQU8sRUFBRSxXQUFXLElBQ2pCLFlBQVksRUFDakI7WUFD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