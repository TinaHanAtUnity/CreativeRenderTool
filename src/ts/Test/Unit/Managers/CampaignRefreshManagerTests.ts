import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { CacheMode, Configuration } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { NativeBridge } from 'Native/NativeBridge';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { PerformanceCampaign } from 'Models/PerformanceCampaign';
import { Observable0, Observable1, Observable2, Observable4 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { Request } from 'Utilities/Request';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { ClientInfo } from 'Models/ClientInfo';
import { VastParser } from 'Utilities/VastParser';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AssetManager } from 'Managers/AssetManager';
import { Cache } from 'Utilities/Cache';
import { Placement, PlacementState } from 'Models/Placement';
import { SessionManager } from 'Managers/SessionManager';
import { EventManager } from 'Managers/EventManager';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { AbstractAdUnit } from 'AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { Vast } from 'Models/Vast/Vast';
import { VastAd } from 'Models/Vast/VastAd';
import { MRAIDCampaign } from 'Models/MRAIDCampaign';

import CampaignRefreshManagerTestCampaign1 from 'json/CampaignRefreshManagerTestCampaign1.json';
import CampaignRefreshManagerTestCampaign2 from 'json/CampaignRefreshManagerTestCampaign2.json';
import CampaignRefreshManagerTestConfig from 'json/CampaignRefreshManagerTestConfig.json';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';
import OnCometMraidPlcCampaign from 'json/OnCometMraidPlcCampaign.json';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { LegacyCampaignManager } from 'Managers/LegacyCampaignManager';
import { AuctionCampaignManager } from 'Managers/AuctionCampaignManager';
import { Campaign } from 'Models/Campaign';

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
    let sessionManager: SessionManager;
    let eventManager: EventManager;
    let container: AdUnitContainer;
    let campaignRefreshManager: CampaignRefreshManager;
    let metaDataManager: MetaDataManager;

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
                getKeys: sinon.stub().returns(Promise.resolve([])),
                onSet: new Observable2()
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
                logInfo: sinon.spy(),
                logError: sinon.spy()
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
            Lifecycle: {
                onActivityResumed: new Observable1(),
                onActivityPaused: new Observable1()
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };

        metaDataManager = new MetaDataManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge);
        request = new Request(nativeBridge, wakeUpManager);
        eventManager = new EventManager(nativeBridge, request);
        deviceInfo = new DeviceInfo(nativeBridge);
        sessionManager = new SessionManager(nativeBridge, clientInfo, deviceInfo, eventManager, metaDataManager);
        assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request), CacheMode.DISABLED, deviceInfo);
        container = new TestContainer();
    });

    describe('Non-PLC campaigns', () => {
        beforeEach(() => {
            configuration = new Configuration(JSON.parse(CampaignRefreshManagerTestConfig));
            campaignManager = new LegacyCampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);
        });

        it('get campaign should return undefined', () => {
            assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
        });

        it('get campaign should return a campaign (Performance)', () => {
            const campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('rewardedVideo') instanceof PerformanceCampaign);

                const campaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, campaign);
                if (campaign) {
                    assert.equal(campaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (Vast)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                const vast = new Vast([new VastAd()], ['ErrorUrl']);
                sinon.stub(vast, 'getVideoUrl').returns('https://video.url');
                campaignManager.onCampaign.trigger('', new VastCampaign(vast, 'TestCampaignId', 'TestGamerId', 12345));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('rewardedVideo') instanceof VastCampaign);

                const campaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, campaign);
                if (campaign) {
                    assert.equal(campaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (MRAID)', () => {
            const campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                const mraid = new MRAIDCampaign(campaignObject, 'TestGamerId', 12345);
                campaignManager.onCampaign.trigger('', mraid);
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('rewardedVideo') instanceof MRAIDCampaign);

                const campaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, campaign);
                if (campaign) {
                    assert.equal(campaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
            });
        });

        it('should not refresh', () => {
            let campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);
            const campaignObject2: any = JSON.parse(CampaignRefreshManagerTestCampaign2);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                campaignObject = campaignObject2;
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                const campaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, campaign);
                if (campaign) {
                    assert.equal(campaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

                return campaignRefreshManager.refresh().then(() => {
                    assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                    const campaign2 = campaignRefreshManager.getCampaign('rewardedVideo');
                    assert.notEqual(undefined, campaign2);
                    if (campaign2) {
                        assert.notEqual(campaign2.getId(), 'TestCampaignId2');
                        assert.equal(campaign2.getId(), 'TestCampaignId');
                    }

                    assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
                });
            });
        });

        it('placement states should end up with NO_FILL', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onNoFill.trigger('');
                return Promise.resolve();
            });

            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.NOT_AVAILABLE);

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.NO_FILL);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.NO_FILL);
            });
        });

        it ('should refresh because of expired campaign', () => {
            const campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);
            const campaignObject2: any = JSON.parse(CampaignRefreshManagerTestCampaign2);

            let campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
            sinon.stub(campaign, 'isExpired').callsFake(() => {
                return true;
            });

            const campaign2 = new PerformanceCampaign(campaignObject2, 'TestGamerId', 12345);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('', campaign);
                campaign = campaign2;
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

                return campaignRefreshManager.refresh().then(() => {
                    assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                    const tmpCampaign2 = campaignRefreshManager.getCampaign('rewardedVideo');
                    assert.notEqual(undefined, tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.equal(tmpCampaign2.getId(), 'TestCampaignId2');
                    }

                    assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
                });
            });
        });

        it('should invalidate campaigns', () => {
            const campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);
            const campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
            const placement: Placement = configuration.getPlacement('rewardedVideo');
            const currentAdUnit = new TestAdUnit(nativeBridge, ForceOrientation.NONE, container, placement, campaign);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('', campaign);
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                const tmpCampaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('incentivizedVideo'), undefined);
            });
        });

        it ('should set campaign status to ready after close', () => {
            const campaignObject: any = JSON.parse(CampaignRefreshManagerTestCampaign1);
            const campaignObject2: any = JSON.parse(CampaignRefreshManagerTestCampaign2);
            let campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
            const campaign2 = new PerformanceCampaign(campaignObject2, 'TestGamerId', 12345);
            const placement: Placement = configuration.getPlacement('rewardedVideo');
            const currentAdUnit = new TestAdUnit(nativeBridge, ForceOrientation.NONE, container, placement, campaign);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('', campaign);
                campaign = campaign2;
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                const tmpCampaign = campaignRefreshManager.getCampaign('rewardedVideo');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('incentivizedVideo'), undefined);

                return campaignRefreshManager.refresh().then(() => {
                    assert.notEqual(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);

                    const tmpCampaign2 = campaignRefreshManager.getCampaign('rewardedVideo');
                    assert.notEqual(undefined, tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.equal(tmpCampaign2.getId(), 'TestCampaignId2');
                    }

                    assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.WAITING);
                    assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.WAITING);

                    currentAdUnit.onClose.trigger();

                    assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.READY);
                });
            });
        });

        it('campaign error should set no fill', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                const error: Error = new Error('TestErrorMessage');
                error.name = 'TestErrorMessage';
                error.stack = 'TestErrorStack';
                campaignManager.onError.trigger(error, ['rewardedVideo', 'incentivizedVideo']);
                return Promise.resolve();
            });

            assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.NOT_AVAILABLE);

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('rewardedVideo'), undefined);
                assert.equal(configuration.getPlacement('rewardedVideo').getState(), PlacementState.NO_FILL);
                assert.equal(configuration.getPlacement('incentivizedVideo').getState(), PlacementState.NO_FILL);
            });
        });
    });

    describe('PLC campaigns', () => {
        beforeEach(() => {
            configuration = new Configuration(JSON.parse(ConfigurationAuctionPlc));
            campaignManager = new AuctionCampaignManager(nativeBridge, configuration, assetManager, sessionManager, request, clientInfo, deviceInfo, vastParser, metaDataManager);
            campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration);
        });

        it('get campaign should return undefined', () => {
            assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
        });

        it('get campaign should return a campaign (Performance)', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof PerformanceCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof PerformanceCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (Vast)', () => {
            const vast = new Vast([new VastAd()], ['ErrorUrl']);
            sinon.stub(vast, 'getVideoUrl').returns('https://video.url');

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', new VastCampaign(vast, 'TestCampaignId', 'TestGamerId', 12345));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof VastCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), 'TestCampaignId');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', new VastCampaign(vast, 'TestCampaignId', 'TestGamerId', 12345));

                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof VastCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (MRAID)', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const mraid = new MRAIDCampaign(campaignObject, 'TestGamerId', 12345);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', mraid);
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof MRAIDCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', mraid);
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof MRAIDCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('should not refresh', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const json2: any = JSON.parse(OnCometMraidPlcCampaign);
            const campaignObject2: any = JSON.parse(json2.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            let campaign: Campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign);
                campaign = new MRAIDCampaign(campaignObject2, 'TestGamerId', 12345);
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                return campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                    assert.notEqual(undefined, tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.notEqual(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                    }

                    const tmpCampaign3 = campaignRefreshManager.getCampaign('premium');
                    assert.notEqual(undefined, tmpCampaign3);
                    if (tmpCampaign3) {
                        assert.equal(tmpCampaign3.getId(), '582bb5e352e4c4abd7fab850');
                    }

                    assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);
                });
            });
        });

        it('placement states should end up with NO_FILL', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                campaignManager.onNoFill.trigger('premium');
                return Promise.resolve();
            });

            assert.equal(configuration.getPlacement('premium').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(configuration.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.NO_FILL);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onNoFill.trigger('video');

                assert.equal(configuration.getPlacement('video').getState(), PlacementState.NO_FILL);
            });
        });

        it('should invalidate campaigns', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
            const placement: Placement = configuration.getPlacement('premium');
            const currentAdUnit = new TestAdUnit(nativeBridge, ForceOrientation.NONE, container, placement, campaign);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', new PerformanceCampaign(campaignObject, 'TestGamerId', 12345));

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
            });
        });

        it ('should set campaign status to ready after close', () => {
            const json: any = JSON.parse(OnCometVideoPlcCampaign);
            const campaignObject: any = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const json2: any = JSON.parse(OnCometMraidPlcCampaign);
            const campaignObject2: any = JSON.parse(json2.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            let campaign: Campaign = new PerformanceCampaign(campaignObject, 'TestGamerId', 12345);
            const campaign2 = new MRAIDCampaign(campaignObject2, 'TestGamerId', 12345);
            const placement: Placement = configuration.getPlacement('premium');
            const currentAdUnit = new TestAdUnit(nativeBridge, ForceOrientation.NONE, container, placement, campaign);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign);
                campaign = campaign2;
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', campaign);

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);

                return campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                    assert.notEqual(undefined, tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.equal(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                    }

                    assert.equal(configuration.getPlacement('premium').getState(), PlacementState.WAITING);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                    currentAdUnit.onClose.trigger();

                    assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                    campaignManager.onCampaign.trigger('video', campaign);
                    currentAdUnit.onClose.trigger();

                    assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
                });
            });
        });

        it('campaign error should set no fill', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                const error: Error = new Error('TestErrorMessage');
                error.name = 'TestErrorMessage';
                error.stack = 'TestErrorStack';
                campaignManager.onError.trigger(error, ['premium', 'video']);
                return Promise.resolve();
            });

            assert.equal(configuration.getPlacement('premium').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(configuration.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.NO_FILL);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.NO_FILL);
            });
        });
    });
});

export class TestContainer extends AdUnitContainer {
    public open(adUnit: AbstractAdUnit, videoplayer: boolean, allowRotation: boolean, forceOrientation: ForceOrientation, disableBackbutton: boolean, options: any): Promise<void> {
        return Promise.resolve();
    }
    public close(): Promise<void> {
        return Promise.resolve();
    }
    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
        return Promise.all([]);
    }
    public reorient(allowRotation: boolean, forceOrientation: ForceOrientation): Promise<any[]> {
        return Promise.all([]);
    }
    public isPaused(): boolean {
        return false;
    }
}

export class TestAdUnit extends AbstractAdUnit {
    public show(): Promise<void> {
        return Promise.resolve();
    }
    public hide(): Promise<void> {
        return Promise.resolve();
    }
    public description(): string {
        return 'TestAdUnit';
    }
    public isShowing() {
        return true;
    }
    public isCached() {
        return false;
    }
}
