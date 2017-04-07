import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { CacheMode, Configuration } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { NativeBridge } from 'Native/NativeBridge';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Observable0, Observable2, Observable4 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { ClientInfo } from 'Models/ClientInfo';
import { VastParser } from 'Utilities/VastParser';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AssetManager } from 'Managers/AssetManager';
import { Cache } from 'Utilities/Cache';
import { PlacementState } from 'Models/Placement';

describe('CampaignRefreshManager', () => {
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let vastParser: VastParser;
    let configuration: Configuration;
    let campaignManager: CampaignManager;
    let wakeUpManager: WakeUpManager;
    let nativeBridge: NativeBridge;
    let request: Request;
    let assetManager: AssetManager;

    beforeEach(() => {
        configuration = new Configuration({
            enabled: true,
            country: 'US',
            coppaCompliant: false,
            placementLevelControl: false,
            assetCaching: 'disabled',
            placements: [
                {id: 'rewardedVideo', name: 'Video', default: true, allowSkip: true, disableBackButton: true, muteVideo: false, useDeviceOrientationForVideo: false, skipInSeconds: 5},
                {id: 'incentivizedVideo', name: 'Video', default: true, allowSkip: true, disableBackButton: true, muteVideo: false, useDeviceOrientationForVideo: false, skipInSeconds: 5}
            ]
        });
    });

    beforeEach(() => {
        clientInfo = TestFixtures.getClientInfo();
        vastParser = TestFixtures.getVastParser();

        nativeBridge = <NativeBridge><any>{
            Placement: {
                setPlacementState: sinon.spy()
            },
            Listener: {
                sendPlacementStateChangedEvent: sinon.spy(),
                sendReadyEvent: sinon.spy()
            },
            Storage: {
                get: function(storageType: number, key: string) {
                    return Promise.resolve('123');
                },
                set: () => {
                    return Promise.resolve();
                },
                write: () => {
                    return Promise.resolve();
                },
                getKeys: sinon.stub().returns(Promise.resolve([]))
            },
            Request: {
                onComplete: {
                    subscribe: sinon.spy()
                },
                onFailed: {
                    subscribe: sinon.spy()
                }
            },
            Cache: {
                setProgressInterval: sinon.spy(),
                onDownloadStarted: new Observable0(),
                onDownloadProgress: new Observable0(),
                onDownloadEnd: new Observable0(),
                onDownloadStopped: new Observable0(),
                onDownloadError: new Observable0(),
            },
            Sdk: {
                logWarning: sinon.spy(),
                logInfo: sinon.spy()
            },
            Connectivity: {
                onConnected: new Observable2()
            },
            Broadcast: {
                onBroadcastAction: new Observable4()
            },
            Notification: {
                onNotification: new Observable2()
            },
            DeviceInfo: {
                getConnectionType: sinon.stub().returns(Promise.resolve('wifi')),
                getNetworkType: sinon.stub().returns(Promise.resolve(0))
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };

        wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
        deviceInfo = new DeviceInfo(nativeBridge);
        assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED);
        campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, request, clientInfo, deviceInfo, vastParser);
    });

    it('get campaign should return undefined', () => {
        const campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);
        assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
    });

    it('get campaign should return a campaign', () => {
        const campaignObject: any = {
            id: 'TestCampaignId',
            appStoreId: 'TestAppstoreId',
            appStoreCountry: 'US',
            gameId: 12345,
            gameName: 'TestGameName',
            gameIcon: 'https://TestGameIcon',
            rating: 5,
            endScreenLandscape: 'https://TestEndScreenLandscape',
            endScreenPortrait: 'https://TestEndScreenPortrait',
            trailerDownloadable: 'https://TestTrailerDownloadable',
            trailerDownloadableSize: 12345,
            trailerStreaming: 'https://TestTrailerStreaming',
            clickAttributionUrl: 'https://TestClickAttributionUrl',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false,
            store: 'google'
        };

        sinon.stub(campaignManager, 'request').callsFake(() => {
            campaignManager.onPerformanceCampaign.trigger(new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
            return Promise.resolve();
        });

        const campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);
        return campaignRefreshManager.refresh().then(() => {
            assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
            assert.equal(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId');
            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
        });
    });

    it('should not refresh', () => {
        let campaignObject: any = {
            id: 'TestCampaignId',
            appStoreId: 'TestAppstoreId',
            appStoreCountry: 'US',
            gameId: 12345,
            gameName: 'TestGameName',
            gameIcon: 'https://TestGameIcon',
            rating: 5,
            endScreenLandscape: 'https://TestEndScreenLandscape',
            endScreenPortrait: 'https://TestEndScreenPortrait',
            trailerDownloadable: 'https://TestTrailerDownloadable',
            trailerDownloadableSize: 12345,
            trailerStreaming: 'https://TestTrailerStreaming',
            clickAttributionUrl: 'https://TestClickAttributionUrl',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false,
            store: 'google'
        };

        const campaignObject2: any = {
            id: 'TestCampaignId2',
            appStoreId: 'TestAppstoreId',
            appStoreCountry: 'US',
            gameId: 12345,
            gameName: 'TestGameName',
            gameIcon: 'https://TestGameIcon',
            rating: 5,
            endScreenLandscape: 'https://TestEndScreenLandscape',
            endScreenPortrait: 'https://TestEndScreenPortrait',
            trailerDownloadable: 'https://TestTrailerDownloadable',
            trailerDownloadableSize: 12345,
            trailerStreaming: 'https://TestTrailerStreaming',
            clickAttributionUrl: 'https://TestClickAttributionUrl',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false,
            store: 'google'
        };

        sinon.stub(campaignManager, 'request').callsFake(() => {
            campaignManager.onPerformanceCampaign.trigger(new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
            campaignObject = campaignObject2;
            return Promise.resolve();
        });

        const campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);
        return campaignRefreshManager.refresh().then(() => {
            assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
            assert.equal(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId');
            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId2');
                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId');
                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
            });
        });
    });

    it('placement states should end up with NO_FILL', () => {
        sinon.stub(campaignManager, 'request').callsFake(() => {
            campaignManager.onNoFill.trigger(3600);
            return Promise.resolve();
        });

        const campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);

        assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.WAITING);
        assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.WAITING);

        return campaignRefreshManager.refresh().then(() => {
            assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.NO_FILL);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.NO_FILL);
        });
    });

    it ('should refresh because of expired campaign', () => {
        const campaignObject: any = {
            id: 'TestCampaignId',
            appStoreId: 'TestAppstoreId',
            appStoreCountry: 'US',
            gameId: 12345,
            gameName: 'TestGameName',
            gameIcon: 'https://TestGameIcon',
            rating: 5,
            endScreenLandscape: 'https://TestEndScreenLandscape',
            endScreenPortrait: 'https://TestEndScreenPortrait',
            trailerDownloadable: 'https://TestTrailerDownloadable',
            trailerDownloadableSize: 12345,
            trailerStreaming: 'https://TestTrailerStreaming',
            clickAttributionUrl: 'https://TestClickAttributionUrl',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false,
            store: 'google'
        };

        const campaignObject2: any = {
            id: 'TestCampaignId2',
            appStoreId: 'TestAppstoreId',
            appStoreCountry: 'US',
            gameId: 12345,
            gameName: 'TestGameName',
            gameIcon: 'https://TestGameIcon',
            rating: 5,
            endScreenLandscape: 'https://TestEndScreenLandscape',
            endScreenPortrait: 'https://TestEndScreenPortrait',
            trailerDownloadable: 'https://TestTrailerDownloadable',
            trailerDownloadableSize: 12345,
            trailerStreaming: 'https://TestTrailerStreaming',
            clickAttributionUrl: 'https://TestClickAttributionUrl',
            clickAttributionUrlFollowsRedirects: false,
            bypassAppSheet: false,
            store: 'google'
        };

        let campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
        sinon.stub(campaign, 'isExpired').callsFake(() => {
            return true;
        });

        const campaign2 = new PerformanceCampaign(campaignObject2, 'TestGamerId', 12345);

        sinon.stub(campaignManager, 'request').callsFake(() => {
            campaignManager.onPerformanceCampaign.trigger(campaign);
            campaign = campaign2;
            return Promise.resolve();
        });

        const campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);

        return campaignRefreshManager.refresh().then(() => {
            assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
            assert.equal(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId');
            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo').getId(), 'TestCampaignId2');
                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
            });
        });
    });
});
