import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { CacheMode, Configuration } from 'Core/Models/Configuration';
import { CampaignManager } from 'Ads/Managers/CampaignManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { RefreshManager } from 'Ads/Managers/RefreshManager';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { Observable0, Observable1, Observable2, Observable4 } from 'Core/Utilities/Observable';
import { Platform } from 'Common/Constants/Platform';
import { INativeResponse, Request } from 'Core/Utilities/Request';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { VastParser } from 'Ads/Utilities/VastParser';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { AssetManager } from 'Ads/Managers/AssetManager';
import { Cache, CacheStatus } from 'Core/Utilities/Cache';
import { Placement, PlacementState } from 'Ads/Models/Placement';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdUnitContainer, Orientation, ViewConfiguration } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { AbstractAdUnit, IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';
import { VastCampaign } from 'Ads/Models/Vast/VastCampaign';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';
import { XPromoCampaign } from 'Ads/Models/Campaigns/XPromoCampaign';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { FocusManager } from 'Core/Managers/FocusManager';
import { Campaign } from 'Ads/Models/Campaign';
import { ConfigurationParser } from 'Core/Parsers/ConfigurationParser';

import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import ConfigurationPromoPlacements from 'json/ConfigurationPromoPlacements.json';
import OnCometVideoPlcCampaign from 'json/OnCometVideoPlcCampaign.json';

import { Diagnostics } from 'Core/Utilities/Diagnostics';
import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { AdMobSignalFactory } from 'Ads/AdMob/AdMobSignalFactory';
import { AdMobSignal } from 'Ads/Models/AdMobSignal';
import { AdMobOptionalSignal } from 'Ads/Models/AdMobOptionalSignal';
import { CacheBookkeeping } from 'Core/Utilities/CacheBookkeeping';
import { OldCampaignRefreshManager } from 'Ads/Managers/OldCampaignRefreshManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { JaegerManager } from 'Core/Jaeger/JaegerManager';
import { JaegerSpan } from 'Core/Jaeger/JaegerSpan';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { PromoCampaign } from 'Ads/Models/Campaigns/PromoCampaign';
import { PurchasingUtilities } from 'Ads/Utilities/PurchasingUtilities';
import { PlacementManager } from 'Ads/Managers/PlacementManager';

export class TestContainer extends AdUnitContainer {
    public open(adUnit: AbstractAdUnit, views: string[], allowRotation: boolean, forceOrientation: Orientation, disableBackbutton: boolean, options: any): Promise<void> {
        return Promise.resolve();
    }
    public close(): Promise<void> {
        return Promise.resolve();
    }
    public reconfigure(configuration: ViewConfiguration): Promise<any[]> {
        return Promise.all([]);
    }
    public reorient(allowRotation: boolean, forceOrientation: Orientation): Promise<any[]> {
        return Promise.all([]);
    }
    public isPaused(): boolean {
        return false;
    }
    public setViewFrame(view: string, x: number, y: number, width: number, height: number): Promise<void> {
        return Promise.resolve();
    }
    public getViews(): Promise<string[]> {
        return Promise.all([]);
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
    let campaignRefreshManager: RefreshManager;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let adUnitParams: IAdUnitParameters<Campaign>;
    let operativeEventManager: OperativeEventManager;
    let adMobSignalFactory: AdMobSignalFactory;
    let cacheBookkeeping: CacheBookkeeping;
    let cache: Cache;
    let jaegerManager: JaegerManager;
    let gdprManager: GdprManager;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let placementManager: PlacementManager;

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
                get: (storageType: number, key: string) => {
                    return Promise.resolve('123');
                },
                set: () => {
                    return Promise.resolve();
                },
                write: () => {
                    return Promise.resolve();
                },
                delete: () => {
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
                onDownloadError: new Observable0()
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

        placementManager = sinon.createStubInstance(PlacementManager);
        PurchasingUtilities.initialize(clientInfo, configuration, nativeBridge, placementManager);
        focusManager = new FocusManager(nativeBridge);
        metaDataManager = new MetaDataManager(nativeBridge);
        wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();
        cacheBookkeeping = new CacheBookkeeping(nativeBridge);
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        cache = new Cache(nativeBridge, wakeUpManager, request, cacheBookkeeping, programmaticTrackingService);
        assetManager = new AssetManager(cache, CacheMode.DISABLED, deviceInfo, cacheBookkeeping, nativeBridge);
        container = new TestContainer();
        const campaign = TestFixtures.getCampaign();
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            configuration: configuration,
            campaign: campaign
        });
        adMobSignalFactory = sinon.createStubInstance(AdMobSignalFactory);
        (<sinon.SinonStub>adMobSignalFactory.getAdRequestSignal).returns(Promise.resolve(new AdMobSignal()));
        (<sinon.SinonStub>adMobSignalFactory.getOptionalSignal).returns(Promise.resolve(new AdMobOptionalSignal()));

        gdprManager = sinon.createStubInstance(GdprManager);

        adUnitParams = {
            forceOrientation: Orientation.NONE,
            focusManager: focusManager,
            container: container,
            deviceInfo: deviceInfo,
            clientInfo: clientInfo,
            thirdPartyEventManager: thirdPartyEventManager,
            operativeEventManager: operativeEventManager,
            placement: TestFixtures.getPlacement(),
            campaign: campaign,
            configuration: configuration,
            request: request,
            options: {},
            gdprManager: gdprManager,
            programmaticTrackingService: programmaticTrackingService
        };

        RefreshManager.ParsingErrorRefillDelay = 0; // prevent tests from hanging due to long retry timeouts
        jaegerManager = sinon.createStubInstance(JaegerManager);
        jaegerManager.isJaegerTracingEnabled = sinon.stub().returns(false);
        jaegerManager.startSpan = sinon.stub().returns(new JaegerSpan('test'));
    });

    describe('PLC campaigns', () => {
        beforeEach(() => {
            configuration = ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc));
            campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfo, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
            campaignRefreshManager = new OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfo, request, cache);
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
                campaignManager.onError.trigger(error, ['premium', 'video'], 'test_diagnostics_type', undefined);
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
                throw CacheStatus.FAILED;
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
                assert.equal(receivedErrorType , 'campaign_caching_failed', 'Incorrect error type');
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
                assert.equal(receivedError.error.message , 'test error', 'Incorrect error message');
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
                assert.equal(receivedErrorType , 'handle_campaign_error', 'Incorrect error type');
                assert.equal(receivedError.error.message , 'Unsupported content-type: wrong/contentType', 'Incorrect error message');
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
                assert.equal(receivedErrorType, 'error_creating_handle_campaign_chain', 'Incorrect error type');
                assert.equal(receivedError.error.message, 'model: AuctionResponse key: contentType with value: 1: integer is not in: string', 'Incorrect error message');
            });
        });
    });

    describe('On Promo', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const clientInfoPromoGame = TestFixtures.getClientInfo(Platform.ANDROID, '00000');
            configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfoPromoGame, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
            campaignRefreshManager = new OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfoPromoGame, request, cache);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should mark a placement for a promo campaign as ready', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('promoPlacement', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('promoPlacement'));
                assert.isTrue(campaignRefreshManager.getCampaign('promoPlacement') instanceof PromoCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('promoPlacement');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                    assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                }

                assert.equal(configuration.getPlacement('promoPlacement').getState(), PlacementState.READY);
            });
        });

        it('should mark a placement for a promo campaign as nofill if product is not available', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('promoPlacement', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(configuration.getPlacement('promoPlacement').getState(), PlacementState.NO_FILL);
            });
        });
    });

    describe('With mixed placement campaigns', () => {
        let sandbox: sinon.SinonSandbox;
        beforeEach(() => {
            sandbox = sinon.createSandbox();
            const clientInfoPromoGame = TestFixtures.getClientInfo(Platform.ANDROID, '1003628');
            configuration = ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements));
            campaignManager = new CampaignManager(nativeBridge, configuration, assetManager, sessionManager, adMobSignalFactory, request, clientInfoPromoGame, deviceInfo, metaDataManager, cacheBookkeeping, jaegerManager);
            campaignRefreshManager = new OldCampaignRefreshManager(nativeBridge, wakeUpManager, campaignManager, configuration, focusManager, sessionManager, clientInfoPromoGame, request, cache);
        });

        afterEach(() => {
            sandbox.restore();
        });

        it('should mark a placement for a mixed placement promo campaign as ready', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('mixedPlacement-promo'));
                assert.isTrue(campaignRefreshManager.getCampaign('mixedPlacement-promo') instanceof PromoCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                    assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                }

                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.READY);
            });
        });

        it('should mark a placement for a mixed placement promo campaign as nofill if product is not available', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(false);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.NO_FILL);
            });
        });

        it('should mark a placement for a mixed placement with rewarded campaign as ready', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('testDashPlacement-rewarded', TestFixtures.getCampaign());
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('testDashPlacement-rewarded'));
                assert.isTrue(campaignRefreshManager.getCampaign('testDashPlacement-rewarded') instanceof PerformanceCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('testDashPlacement-rewarded');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '582bb5e352e4c4abd7fab850');
                }

                assert.equal(configuration.getPlacement('testDashPlacement-rewarded').getState(), PlacementState.READY);
            });
        });

        it('should mark a placement for a mixed placement with rewardedpromo campaign as ready', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('rewardedPromoPlacement-rewardedpromo', TestFixtures.getPromoCampaign('purchasing/iap', true));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo'));
                assert.isTrue(campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo') instanceof PromoCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('rewardedPromoPlacement-rewardedpromo');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                }

                assert.equal(configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getState(), PlacementState.READY);
            });
        });

        it('if mixed placement is already marked as ready then any other mixed placement should be marked as nofill', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures.getPromoCampaign('purchasing/iap'));
                campaignManager.onCampaign.trigger('testDashPlacement-rewarded', TestFixtures.getPromoCampaign('purchasing/iap'));
                campaignManager.onCampaign.trigger('rewardedPromoPlacement-rewardedpromo', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            return campaignRefreshManager.refresh().then(() => {
                assert.isDefined(campaignRefreshManager.getCampaign('mixedPlacement-promo'));
                assert.isTrue(campaignRefreshManager.getCampaign('mixedPlacement-promo') instanceof PromoCampaign);

                const tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                    assert.equal(tmpCampaign.getAdType(), 'purchasing/iap');
                }

                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('testDashPlacement-rewarded').getState(), PlacementState.NO_FILL);
                assert.equal(configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getState(), PlacementState.NO_FILL);
            });
        });

        it('should invalidate mixed rewarded campaigns and set suffixed placement as ready the second time onCampaign is triggered after being invalidated', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            const campaign = TestFixtures.getPromoCampaign();
            const placement: Placement = configuration.getPlacement('premium');
            adUnitParams.campaign = campaign;
            adUnitParams.placement = placement;
            const currentAdUnit = new TestAdUnit(nativeBridge, adUnitParams);

            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures.getPromoCampaign('purchasing/iap'));
                return Promise.resolve();
            });

            sinon.stub(campaignRefreshManager, 'shouldRefill').returns(true);

            return campaignRefreshManager.refresh().then(() => {
                const tmpCampaign = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                assert.isDefined(tmpCampaign);
                if (tmpCampaign) {
                    assert.equal(tmpCampaign.getId(), '000000000000000000000123');
                }

                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onCampaign.trigger('video', TestFixtures.getCampaign());

                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.READY);
                assert.equal(configuration.getPlacement('video').getState(), PlacementState.READY);

                assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-rewarded'), undefined);
                assert.notEqual(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);
                assert.notEqual(campaignRefreshManager.getCampaign('video'), undefined);

                campaignRefreshManager.setCurrentAdUnit(currentAdUnit);
                currentAdUnit.onStart.trigger();

                assert.equal(campaignRefreshManager.getCampaign('mixedPlacement'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);
                assert.equal(campaignRefreshManager.getCampaign('video'), undefined);

                campaignRefreshManager.refresh().then(() => {
                    const tmpCampaign2 = campaignRefreshManager.getCampaign('mixedPlacement-promo');
                    assert.isDefined(tmpCampaign2);
                    if (tmpCampaign2) {
                        assert.equal(tmpCampaign2.getId(), '000000000000000000000123');
                    }

                    assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.WAITING);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                    currentAdUnit.onClose.trigger();

                    assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.READY);
                    assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);
                });
            });
        });

        it('placement states should end up with NO_FILL if mixed', () => {
            sandbox.stub(PurchasingUtilities, 'isProductAvailable').returns(true);
            sinon.stub(campaignManager, 'request').callsFake(() => {
                campaignManager.onCampaign.trigger('mixedPlacement-promo', TestFixtures.getPromoCampaign('purchasing/iap'));
                campaignManager.onNoFill.trigger('mixedPlacement-promo');
                return Promise.resolve();
            });

            assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.NOT_AVAILABLE);
            assert.equal(configuration.getPlacement('video').getState(), PlacementState.NOT_AVAILABLE);

            return campaignRefreshManager.refresh().then(() => {
                assert.equal(campaignRefreshManager.getCampaign('mixedPlacement-promo'), undefined);

                assert.equal(configuration.getPlacement('mixedPlacement-promo').getState(), PlacementState.NO_FILL);

                assert.equal(configuration.getPlacement('video').getState(), PlacementState.WAITING);

                campaignManager.onNoFill.trigger('video');

                assert.equal(configuration.getPlacement('video').getState(), PlacementState.NO_FILL);
            });
        });
    });
});
