import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { CacheMode, Configuration } from 'Models/Configuration';
import { CampaignManager } from 'Managers/CampaignManager';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { NativeBridge } from 'Native/NativeBridge';
import { CampaignRefreshManager } from 'Managers/CampaignRefreshManager';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { Observable0, Observable1, Observable2, Observable4 } from 'Utilities/Observable';
import { Platform } from 'Constants/Platform';
import { INativeResponse, Request } from 'Utilities/Request';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { ClientInfo } from 'Models/ClientInfo';
import { VastParser } from 'Utilities/VastParser';
import { DeviceInfo } from 'Models/DeviceInfo';
import { AssetManager } from 'Managers/AssetManager';
import { Cache } from 'Utilities/Cache';
import { Placement, PlacementState } from 'Models/Placement';
import { SessionManager } from 'Managers/SessionManager';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { ComScoreTrackingService } from 'Utilities/ComScoreTrackingService';
import { AdUnitContainer, ForceOrientation, ViewConfiguration } from 'AdUnits/Containers/AdUnitContainer';
import { AbstractAdUnit, IAdUnitParameters } from 'AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { XPromoCampaign } from 'Models/Campaigns/XPromoCampaign';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { FocusManager } from 'Managers/FocusManager';
import { Campaign } from 'Models/Campaign';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';

import { Diagnostics } from 'Utilities/Diagnostics';
import { OperativeEventManager } from 'Managers/OperativeEventManager';
import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';
import { AdMobSignal } from 'Models/AdMobSignal';
import { CacheBookkeeping } from 'Utilities/CacheBookkeeping';

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
    let thirdPartyEventManager: ThirdPartyEventManager;
    let container: AdUnitContainer;
    let campaignRefreshManager: CampaignRefreshManager;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adUnitParams: IAdUnitParameters<Campaign>;
    let operativeEventManager: OperativeEventManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let comScoreService: ComScoreTrackingService;
    let cacheBookkeeping: CacheBookkeeping;

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
                logError: sinon.spy(),
                logDebug: sinon.spy()
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
                getNetworkType: sinon.stub().returns(Promise.resolve(0)),
                getUniqueEventId: sinon.stub().returns(Promise.resolve('12345'))
            },
            Lifecycle: {
                onActivityResumed: new Observable1(),
                onActivityPaused: new Observable1(),
                onActivityDestroyed: new Observable1()
            },
            getPlatform: () => {
                return Platform.TEST;
            }
        };

        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        cacheBookkeeping = new CacheBookkeeping(nativeBridge);
        assetManager = new AssetManager(new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping), CacheMode.DISABLED, deviceInfo, cacheBookkeeping);
        container = new TestContainer();
        operativeEventManager = new OperativeEventManager(nativeBridge, request, metaDataManager, sessionManager, clientInfo, deviceInfo);
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        comScoreService = new ComScoreTrackingService(thirdPartyEventManager, nativeBridge, deviceInfo);

        adUnitParams = {
            forceOrientation: ForceOrientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            comScoreTrackingService: comScoreService,
            placement: TestFixtures.getPlacement(),
            campaign: TestFixtures.getCampaign(),
            configuration: configuration,
            request: request,
            options: {}
        };

        CampaignRefreshManager.ParsingErrorRefillDelay = 0; // prevent tests from hanging due to long retry timeouts
    });

    describe('PLC campaigns', () => {
        beforeEach(() => {
            configuration = new Configuration(JSON.parse(ConfigurationAuctionPlc));
            campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager);
            campaignRefreshManager = new CampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager);
        });

        it('get campaign should return undefined', () => {
            assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
        });

        it('get campaign should return a campaign (Performance)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign());
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

                campaignManager.onCampaign.trigger('video', TestFixtures.getCampaign());
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof PerformanceCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (XPromo)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getXPromoCampaign());
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.notEqual(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof XPromoCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.notEqual(undefined, tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', TestFixtures.getXPromoCampaign());
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof XPromoCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (Vast)', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCompanionVastCampaign());
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof VastCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '12345');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', TestFixtures.getCompanionVastCampaign());

                assert.isDefined(campaignRefreshManager.getCampaign('video'));
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof VastCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('get campaign should return a campaign (MRAID)', () => {
            const mraid = TestFixtures.getPlayableMRAIDCampaign();

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', mraid);
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('premium'));
                assert.isTrue(campaignRefreshManager.getCampaign('premium') instanceof MRAIDCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '58dec182f01b1c0cdef54f0f');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', mraid);
                assert.isDefined(campaignRefreshManager.getCampaign('video'));
                assert.isTrue(campaignRefreshManager.getCampaign('video') instanceof MRAIDCampaign);
                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);
            });
        });

        it('should not refresh', () => {
            let campaign: Campaign = TestFixtures.getCampaign();

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign);
                campaign = TestFixtures.getPlayableMRAIDCampaign();
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                return campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('premium');
                    assert.isDefined(tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.notEqual(tmpCampaign2.getId(), '58dec182f01b1c0cdef54f0f');
                    }

                    const tmpCampaign3 = campaignRefreshManager.getCampaign('premium');
                    assert.isDefined(tmpCampaign3);
                    if (tmpCampaign3) {
                        assert.equal(tmpCampaign3.getId(), '582bb5e352e4c4abd7fab850');
                    }

                    assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);
                });
            });
        });

        it('placement states should end up with NO_FILL', () => {
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign());
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
            const campaign = TestFixtures.getCampaign();
            const placement: Placement = configuration.getPlacement('premium');
            adUnitParams.campaign = campaign;
            adUnitParams.placement = placement;
            const currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', TestFixtures.getCampaign());
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', TestFixtures.getCampaign());

                assert.equal(configuration.getPlacement('premium').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('premium'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);
            });
        });

        it ('should set campaign status to ready after close', () => {
            let campaign: Campaign = TestFixtures.getCampaign();
            const campaign2 = TestFixtures.getPlayableMRAIDCampaign();
            const placement: Placement = configuration.getPlacement('premium');
            adUnitParams.campaign = campaign;
            adUnitParams.placement = placement;
            const currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('premium', campaign);
                campaign = campaign2;
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('premium');
                assert.isDefined(tmpCampaign);
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
                    assert.isDefined(tmpCampaign2);
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
                campaignManager.onError.trigger(error, ['premium', 'video'], undefined);
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

        it('should send diagnostics when campaign caching fails', () => {
            sinon.stub(assetManager, 'setup').callsFake(() => {
                throw new Error('test error');
            });

            let receivedErrorType: string;
            let receivedError: any;

            const diagnosticsStub = sinon.stub(Diagnostics, 'trigger').callsFake((type: string, error: {}) => {
                receivedErrorType = type;
                receivedError = error;
            });

            sinon.stub(request, 'post').callsFake(() => {
                return Promise.resolve(<INativeResponse> {
                    response: OnCometVideoPlcCampaign,
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });

            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType , 'auction_request_failed', 'Incorrect error type');
                assert.equal(receivedError.error.message ,'test error', 'Incorrect error message');
            });
        });

        it('should send diagnostics when campaign request fails', () => {
            let receivedErrorType: string;
            let receivedError: any;

            const diagnosticsStub = sinon.stub(Diagnostics, 'trigger').callsFake((type: string, error: {}) => {
                receivedErrorType = type;
                receivedError = error;
            });

            sinon.stub(request, 'post').callsFake(() => {
                return Promise.reject(new Error('test error'));
            });

            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType , 'auction_request_failed', 'Incorrect error type');
                assert.equal(receivedError.error.message ,'test error', 'Incorrect error message');
            });
        });

        it('should send diagnostics when campaign response content type is wrong', () => {
            let receivedErrorType: string;
            let receivedError: any;

            const diagnosticsStub = sinon.stub(Diagnostics, 'trigger').callsFake((type: string, error: {}) => {
                receivedErrorType = type;
                receivedError = error;
            });

            sinon.stub(request, 'post').callsFake(() => {
                const json = JSON.parse(OnCometVideoPlcCampaign);
                json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 'wrong/contentType';
                return Promise.resolve(<INativeResponse> {
                    response: JSON.stringify(json),
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });

            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType , 'auction_request_failed', 'Incorrect error type');
                assert.equal(receivedError.error.message ,'Unsupported content-type: wrong/contentType', 'Incorrect error message');
            });
        });

        it('should send diagnostics when campaign response parsing fails because of wrong types', () => {
            let receivedErrorType: string;
            let receivedError: any;

            const diagnosticsStub = sinon.stub(Diagnostics, 'trigger').callsFake((type: string, error: {}) => {
                receivedErrorType = type;
                receivedError = error;
            });

            sinon.stub(request, 'post').callsFake(() => {
                const json = JSON.parse(OnCometVideoPlcCampaign);
                json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].contentType = 1;
                return Promise.resolve(<INativeResponse> {
                    response: JSON.stringify(json),
                    url: 'www.test.com',
                    responseCode: 200,
                    headers: []
                });
            });

            return campaignRefreshManager.refresh().then(() => {
                diagnosticsStub.restore();
                assert.equal(receivedErrorType , 'auction_request_failed', 'Incorrect error type');
                assert.equal(receivedError.error.message ,'model: AuctionResponse key: contentType with value: 1: integer is not in: string', 'Incorrect error message');
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
    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return Promise.resolve();
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
