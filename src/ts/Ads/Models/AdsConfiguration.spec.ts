import { CacheMode } from 'Core/Models/CoreConfiguration';
import { Placement } from 'Ads/Models/Placement.ts';
import { AdsConfiguration, IAdsConfiguration } from 'Ads/Models/AdsConfiguration';

describe('AdsConfigurationTest', () => {
    let adsConfiguration: AdsConfiguration;

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
            'placement_1': new Placement ({
                id: 'placement_1',
                adUnitId: 'adUnitId_1',
                groupId: 'groupId_1',
                ...commonFields
            }),
            'placement_2': new Placement ({
                id: 'placement_2',
                adUnitId: 'adUnitId_1',
                groupId: 'groupId_1',
                ...commonFields
            }),
            'placement_3': new Placement ({
                id: 'placement_3',
                adUnitId: 'adUnitId_1',
                groupId: 'groupId_1',
                ...commonFields
            }),
            'placement_4': new Placement ({
                id: 'placement_4',
                adUnitId: 'adUnitId_2',
                groupId: 'groupId_2',
                ...commonFields
            }),
            'placement_5': new Placement ({
                id: 'placement_5',
                ...commonFields
            }),
            'placement_6': new Placement ({
                id: 'placement_6',
                adUnitId: 'adUnitId_2',
                groupId: 'groupId_2',
                ...commonFields
            })
        };

        const configurationParams: IAdsConfiguration = {
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
