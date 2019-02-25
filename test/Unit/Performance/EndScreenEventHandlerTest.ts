import { Activity } from 'Ads/AdUnits/Containers/Activity';
import { AdUnitContainer, Orientation } from 'Ads/AdUnits/Containers/AdUnitContainer';
import { ViewController } from 'Ads/AdUnits/Containers/ViewController';

import { IEndScreenDownloadParameters } from 'Ads/EventHandlers/EndScreenEventHandler';
import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { IOperativeEventParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { AdsConfiguration } from 'Ads/Models/AdsConfiguration';
import { Video } from 'Ads/Models/Assets/Video';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { IEndScreenParameters } from 'Ads/Views/EndScreen';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { INativeResponse, RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import { IPerformanceAdUnitParameters, PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';
import { PerformanceEndScreenEventHandler } from 'Performance/EventHandlers/PerformanceEndScreenEventHandler';
import { PerformanceCampaign, StoreName } from 'Performance/Models/PerformanceCampaign';
import { PerformanceEndScreen } from 'Performance/Views/PerformanceEndScreen';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { IStoreHandler, IStoreHandlerParameters } from 'Ads/EventHandlers/StoreHandlers/StoreHandler';
import { StoreHandlerFactory } from 'Ads/EventHandlers/StoreHandlers/StoreHandlerFactory';
import { Campaign } from 'Ads/Models/Campaign';
import { DownloadManager, DownloadMessage, DownloadState } from 'China/Managers/DownloadManager';
import { DownloadStatus } from 'China/Native/Android/Download';
import { DeviceIdManager } from 'China/Managers/DeviceIdManager';
import { IChinaApi } from 'China/IChina';
import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { IStoreApi } from 'Store/IStore';

describe('EndScreenEventHandlerTest', () => {

    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let store: IStoreApi;
    let container: AdUnitContainer;
    let overlay: VideoOverlay;
    let endScreen: PerformanceEndScreen;
    let storageBridge: StorageBridge;
    let sessionManager: SessionManager;
    let performanceAdUnit: PerformanceAdUnit;
    let metaDataManager: MetaDataManager;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let performanceAdUnitParameters: IPerformanceAdUnitParameters;
    let endScreenEventHandler: PerformanceEndScreenEventHandler;
    let campaign: PerformanceCampaign;
    let placement: Placement;
    let coreConfig: CoreConfiguration;
    let adsConfig: AdsConfiguration;
    let storeHandler: IStoreHandler;

    describe('with onDownloadAndroid', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);

            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getCampaign();
            focusManager = new FocusManager(platform, core);
            container = new Activity(core, ads, TestFixtures.getAndroidDeviceInfo(core));
            metaDataManager = new MetaDataManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
            deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);
            coreConfig = TestFixtures.getCoreConfiguration();
            adsConfig = TestFixtures.getAdsConfiguration();
            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid'
            });
            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            sinon.spy(core.Android!.Intent, 'launch');

            const video = new Video('', TestFixtures.getSession());
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, campaign, privacyManager, false, false);
            const endScreenParams : IEndScreenParameters = {
                platform,
                core,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: TestFixtures.getCampaign().getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, TestFixtures.getCampaign());
            placement = TestFixtures.getPlacement();

            const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            const programmticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            performanceAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                privacyManager: privacyManager,
                programmaticTrackingService: programmticTrackingService
            };

            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

            const storeHandlerParameters: IStoreHandlerParameters = {
                platform,
                core,
                ads,
                store,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
        });

        afterEach(() => {
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide();
        });

        it('should send a click with session manager', () => {
            endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                store: performanceAdUnitParameters.campaign.getStore(),
                clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
            });

            const params: IOperativeEventParams = { placement: placement,
                videoOrientation: 'landscape',
                adUnitStyle: undefined,
                asset: performanceAdUnit.getVideo()
            };
            sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
        });

        describe('with store type standalone_android and appDownloadUrl', () => {
            const sandbox = sinon.sandbox.create();
            const apkCampaign = TestFixtures.getCampaignStandaloneAndroid();

            const downloadParameters = <IEndScreenDownloadParameters>{
                appStoreId: apkCampaign.getAppStoreId(),
                bypassAppSheet: apkCampaign.getBypassAppSheet(),
                gameId: apkCampaign.getGameId(),
                store: apkCampaign.getStore(),
                clickAttributionUrlFollowsRedirects: true,
                clickAttributionUrl: apkCampaign.getClickAttributionUrl(),
                appDownloadUrl: apkCampaign.getAppDownloadUrl()
            };

            beforeEach(() => {
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = apkCampaign;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

                    const storeHandlerParameters: IStoreHandlerParameters = {
                        platform,
                        core,
                        ads,
                        store,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        placement: placement,
                        adUnit: performanceAdUnit,
                        campaign: apkCampaign,
                        coreConfig: coreConfig
                    };

                    storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                    sandbox.stub(performanceAdUnit, 'hide').callsFake(() => {
                        performanceAdUnit.onClose.trigger();
                    });
                });
            });

            afterEach(() => {
                sandbox.restore();
            });

            it('should call click attribution if clickAttributionUrl is present', () => {
                sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();

                endScreenEventHandler.onEndScreenDownload(downloadParameters);

                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent);
                });
            });

            it('should call click attribution if clickAttributionUrl is present', () => {
                sandbox.stub(thirdPartyEventManager, 'clickAttributionEvent').resolves();

                endScreenEventHandler.onEndScreenDownload(downloadParameters);

                return resolvedPromise.then(() => {
                    sinon.assert.calledOnce(<sinon.SinonSpy>thirdPartyEventManager.clickAttributionEvent);
                });
            });

            describe('device is using china SDK ', () => {
                let downloadManager: DownloadManager;
                let deviceIdManager: DeviceIdManager;
                let china : IChinaApi;

                beforeEach(() => {
                    china = TestFixtures.getChinaApi(nativeBridge);

                    downloadManager = new DownloadManager(core, china, (<AndroidDeviceInfo>deviceInfo).getApiLevel());
                    deviceIdManager = new DeviceIdManager(core, china, deviceInfo);

                    const storeHandlerParameters: IStoreHandlerParameters = {
                        platform,
                        core,
                        ads,
                        store,
                        thirdPartyEventManager: thirdPartyEventManager,
                        operativeEventManager: operativeEventManager,
                        deviceInfo: deviceInfo,
                        clientInfo: clientInfo,
                        placement: placement,
                        adUnit: performanceAdUnit,
                        campaign: apkCampaign,
                        coreConfig: coreConfig,
                        downloadManager: downloadManager,
                        deviceIdManager: deviceIdManager
                    };

                    storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                    sandbox.stub(CustomFeatures, 'isChinaSDK').returns(true);
                });

                xit('should not collect device id if country is not china', (resolve) => {
                    sandbox.stub(coreConfig, 'getCountry').returns('FI');
                    sandbox.stub(<AndroidDeviceInfo>deviceInfo, 'getDeviceId1').returns(undefined);
                    sandbox.stub(downloadManager, 'download').resolves(1);
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();

                    endScreenEventHandler.onEndScreenDownload(downloadParameters);

                    setTimeout(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>deviceIdManager.getDeviceIdsWithPermissionRequest);
                        resolve();
                    }, 5);
                });

                it('should start download if the current download state is not enqueuing', (resolve) => {
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    sandbox.stub(downloadManager, 'download').resolves(1);

                    endScreenEventHandler.onEndScreenDownload(downloadParameters);

                    setTimeout(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.download);
                        resolve();
                    }, 5);
                });

                it('should call download only once if the download url is already being enqueued', (resolve) => {
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    sandbox.stub(downloadManager, 'download').resolves(1);

                    endScreenEventHandler.onEndScreenDownload(downloadParameters);
                    endScreenEventHandler.onEndScreenDownload(downloadParameters);

                    setTimeout(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.download);
                        resolve();
                    }, 5);
                });

                it('should not start the download if download state is enqueuing', (resolve) => {
                    sandbox.stub(downloadManager, 'getState').returns(DownloadState.ENQUEUING);
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    sandbox.stub(downloadManager, 'download').resolves(1);

                    endScreenEventHandler.onEndScreenDownload(downloadParameters);

                    setTimeout(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>downloadManager.download);
                        resolve();
                    }, 5);
                });

                it('should subscribe to ad unit close event', (resolve) => {
                    sandbox.stub(performanceAdUnit.onClose, 'subscribe');
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    sandbox.stub(downloadManager, 'download').resolves(1);

                    endScreenEventHandler.onEndScreenDownload(downloadParameters);

                    setTimeout(() => {
                        sinon.assert.calledOnce(<sinon.SinonSpy>performanceAdUnit.onClose.subscribe);
                        resolve();
                    }, 5);
                });

                it('should download with decoded appDownloadUrl if encoded', (resolve) => {
                    sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    sandbox.stub(downloadManager, 'download').resolves(1);

                    const customizedDownloadParameters = <IEndScreenDownloadParameters>{
                        ...downloadParameters,
                        appDownloadUrl: encodeURIComponent(String(apkCampaign.getAppDownloadUrl()))
                    };

                    endScreenEventHandler.onEndScreenDownload(customizedDownloadParameters);

                    setTimeout(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.download, apkCampaign.getAppDownloadUrl(), apkCampaign.getGameName(), apkCampaign.getGameName());
                        resolve();
                    }, 5);
                });

                describe('when collecting device id in china', () => {
                    beforeEach(() => {
                        sandbox.stub(coreConfig, 'getCountry').returns('CN');
                        sandbox.stub(downloadManager, 'download').resolves(1);
                    });

                    describe('when deviceId1 is not available and download is clicked', () => {
                        beforeEach(() => {
                            sandbox.stub(<AndroidDeviceInfo>deviceInfo, 'getDeviceId1').returns(undefined);
                        });

                        it('should collect device id', (resolve) => {
                            sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();

                            endScreenEventHandler.onEndScreenDownload(downloadParameters);

                            setTimeout(() => {
                                sinon.assert.calledOnce(<sinon.SinonSpy>deviceIdManager.getDeviceIdsWithPermissionRequest);
                                resolve();
                            }, 5);
                        });

                        it('should call download after device id collection resolves', (resolve) => {
                            sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();

                            endScreenEventHandler.onEndScreenDownload(downloadParameters);

                            setTimeout(() => {
                                sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.download);
                                resolve();
                            }, 5);
                        });

                        it('should call download after device id collection fails', (resolve) => {
                            sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').rejects();

                            endScreenEventHandler.onEndScreenDownload(downloadParameters);

                            setTimeout(() => {
                                sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.download);
                                resolve();
                            }, 5);
                        });
                    });

                    describe('when deviceId1 is available and download is clicked', () => {
                        beforeEach(() => {
                            sandbox.stub(<AndroidDeviceInfo>deviceInfo, 'getDeviceId1').returns('17');
                        });

                        it('should not collect device id', (resolve) => {
                            sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();

                            endScreenEventHandler.onEndScreenDownload(downloadParameters);

                            setTimeout(() => {
                                sinon.assert.notCalled(<sinon.SinonSpy>deviceIdManager.getDeviceIdsWithPermissionRequest);
                                resolve();
                            }, 5);
                        });
                    });
                });

                describe('before download starts', () => {
                    beforeEach(() => {
                        sandbox.stub(performanceAdUnit, 'setDownloadStatusMessage');
                        sandbox.stub(performanceAdUnit, 'disableDownloadButton');
                        sandbox.stub(performanceAdUnit.onClose, 'subscribe');
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                        sandbox.stub(downloadManager, 'download').resolves(1);
                        endScreenEventHandler.onEndScreenDownload(downloadParameters);
                    });

                    it('should disable download button', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledOnce(<sinon.SinonSpy>performanceAdUnit.disableDownloadButton);
                            resolve();
                        }, 5);
                    });

                    it('should set download message to an empty string', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.setDownloadStatusMessage, '');
                            resolve();
                        }, 5);
                    });

                    it('should subscribe on ad unit close event', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledOnce(<sinon.SinonSpy>performanceAdUnit.onClose.subscribe);
                            resolve();
                        }, 5);
                    });
                });

                describe('when download starts', () => {
                    beforeEach(() => {
                        sandbox.stub(performanceAdUnit, 'setDownloadStatusMessage');
                        sandbox.stub(downloadManager.onDownloadUpdate, 'subscribe');
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                        sandbox.stub(downloadManager, 'download').resolves(1);
                        endScreenEventHandler.onEndScreenDownload(downloadParameters);
                    });

                    it('should start download with parameters', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>downloadManager.download, apkCampaign.getAppDownloadUrl(), apkCampaign.getGameName(), apkCampaign.getGameName());
                            resolve();
                        }, 5);
                    });

                    it('should set download message to downloading', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledWith(<sinon.SinonSpy>performanceAdUnit.setDownloadStatusMessage, DownloadMessage.DOWNLOADING);
                            resolve();
                        }, 5);
                    });

                    it('should subscribe for download updates', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.subscribe);
                            resolve();
                        }, 5);
                    });
                });

                describe('when download updates', () => {
                    let onDownloadUpdateCallbacks = <any>[];

                    beforeEach(() => {
                        sandbox.stub(performanceAdUnit, 'setDownloadStatusMessage');
                        sandbox.stub(performanceAdUnit, 'enableDownloadButton');
                        sandbox.stub(downloadManager, 'getCurrentDownloadId').returns(1);
                        sandbox.stub(downloadManager.onDownloadUpdate, 'unsubscribe');
                        sandbox.stub(downloadManager.onDownloadUpdate, 'subscribe').callsFake((callback: any) => {
                            onDownloadUpdateCallbacks.push(callback);
                        });
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                        sandbox.stub(downloadManager, 'download').resolves(1);
                        endScreenEventHandler.onEndScreenDownload(downloadParameters);
                    });

                    afterEach(() => {
                        onDownloadUpdateCallbacks = [];
                    });

                    it('should subscribe for download updates', (resolve) => {
                        setTimeout(() => {
                            sinon.assert.calledOnce(<sinon.SinonSpy>downloadManager.onDownloadUpdate.subscribe);
                            resolve();
                        }, 5);
                    });

                    it('should set download message with progress', (resolve) => {
                        setTimeout(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, DownloadStatus.RUNNING, 10);
                            });
                            sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), `${DownloadMessage.DOWNLOADING} (10%) - ${DownloadMessage.DOWNLOADING_REMINDER}`);
                            resolve();
                        }, 5);
                    });

                    it('should set download message when download fails', (resolve) => {
                        setTimeout(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, DownloadStatus.FAILED, DownloadMessage.GENERIC_ERROR);
                            });
                            sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), DownloadMessage.GENERIC_ERROR);
                            resolve();
                        }, 5);
                    });

                    it('should set download message when download gets paused', (resolve) => {
                        setTimeout(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, DownloadStatus.PAUSED, DownloadMessage.GENERIC_PAUSED_MESSAGE);
                            });
                            sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), DownloadMessage.GENERIC_PAUSED_MESSAGE);
                            resolve();
                        }, 5);
                    });

                    it('should set download message when download is pending', (resolve) => {
                        setTimeout(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(1, DownloadStatus.PENDING, DownloadMessage.DOWNLOADING);
                            });
                            sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), `${DownloadMessage.DOWNLOADING} - ${DownloadMessage.DOWNLOADING_REMINDER}`);
                            resolve();
                        }, 5);
                    });

                    it('should ignore update if it is not for the current download id', (resolve) => {
                        setTimeout(() => {
                            onDownloadUpdateCallbacks.forEach((callback: any) => {
                                callback(2, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                            });
                            sinon.assert.notCalled((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                            sinon.assert.notCalled((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                            resolve();
                        }, 5);
                    });
                });

                describe('when download completes', () => {
                    let onDownloadUpdateCallbacks = <any>[];

                    beforeEach(() => {
                        sandbox.stub(performanceAdUnit, 'setDownloadStatusMessage');
                        sandbox.stub(performanceAdUnit, 'disableDownloadButton');
                        sandbox.stub(performanceAdUnit, 'enableDownloadButton');
                        sandbox.stub(performanceAdUnit.onClose, 'unsubscribe');
                        sandbox.stub(downloadManager, 'getCurrentDownloadId').returns(1);
                        sandbox.stub(downloadManager.onDownloadUpdate, 'unsubscribe');
                        sandbox.stub(downloadManager.onDownloadUpdate, 'subscribe').callsFake((callback: any) => {
                            onDownloadUpdateCallbacks.push(callback);
                        });
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                        sandbox.stub(downloadManager, 'download').resolves(1);
                    });

                    afterEach(() => {
                        onDownloadUpdateCallbacks = [];
                    });

                    describe('with success', () => {
                        const downloadSucceededCallback = ((callback: any) => {
                            callback(1, DownloadStatus.SUCCESSFUL, DownloadMessage.SUCCESS);
                        });

                        beforeEach(() => {
                            endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        });

                        it('should set download message', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadSucceededCallback);
                                sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), DownloadMessage.SUCCESS);
                                resolve();
                            }, 5);
                        });

                        it('should enable download button', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadSucceededCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe update listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadSucceededCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe ad unit close listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadSucceededCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.onClose.unsubscribe));
                                resolve();
                            }, 5);
                        });
                    });

                    describe('with fail', () => {
                        const downloadFailedCallback = ((callback: any) => {
                            callback(1, DownloadStatus.FAILED, DownloadMessage.GENERIC_ERROR);
                        });

                        beforeEach(() => {
                            endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        });

                        it('should set download message', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadFailedCallback);
                                sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), DownloadMessage.GENERIC_ERROR);
                                resolve();
                            }, 5);
                        });

                        it('should enable download button', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadFailedCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe update listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadFailedCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe ad unit close listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadFailedCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.onClose.unsubscribe));
                                resolve();
                            }, 5);
                        });
                    });

                    describe('with canceled', () => {
                        const downloadCanceledCallback = ((callback: any) => {
                            callback(1, DownloadStatus.CANCELED_OR_NOT_FOUND, DownloadMessage.CANCELED_OR_NOT_FOUND);
                        });

                        beforeEach(() => {
                            endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        });

                        it('should set download message', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadCanceledCallback);
                                sinon.assert.calledWith((<sinon.SinonStub>performanceAdUnit.setDownloadStatusMessage).getCall(2), DownloadMessage.CANCELED_OR_NOT_FOUND);
                                resolve();
                            }, 5);
                        });

                        it('should enable download button', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadCanceledCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe update listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadCanceledCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe ad unit close listener', (resolve) => {
                            setTimeout(() => {
                                onDownloadUpdateCallbacks.forEach(downloadCanceledCallback);
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.onClose.unsubscribe));
                                resolve();
                            }, 5);
                        });
                    });
                });

                describe('when download fails', () => {
                    beforeEach(() => {
                        sandbox.stub(performanceAdUnit, 'setDownloadStatusMessage');
                        sandbox.stub(performanceAdUnit, 'disableDownloadButton');
                        sandbox.stub(performanceAdUnit, 'enableDownloadButton');
                        sandbox.stub(performanceAdUnit.onClose, 'unsubscribe');
                        sandbox.stub(downloadManager, 'getState').returns(DownloadState.READY);
                        sandbox.stub(downloadManager, 'getCurrentDownloadId').returns(1);
                        sandbox.stub(downloadManager.onDownloadUpdate, 'unsubscribe');
                        sandbox.stub(downloadManager.onDownloadUpdate, 'subscribe');
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                    });

                    describe('with download id equals to -1 indicating fallback to browser', () => {
                        beforeEach(() => {
                            sandbox.stub(downloadManager, 'download').resolves(-1);
                            endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        });
                        it('should set download message', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledWith((<sinon.SinonSpy>performanceAdUnit.setDownloadStatusMessage).secondCall, DownloadMessage.OPENING_BROWSER);
                                resolve();
                            }, 5);
                        });

                        it('should enable download button', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe update listener', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe ad unit close listener', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.onClose.unsubscribe));
                                resolve();
                            }, 5);
                        });
                    });

                    describe('with download exception', () => {
                        beforeEach(() => {
                            sandbox.stub(downloadManager, 'download').rejects(new Error('download_error'));
                            endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        });

                        it('should set download message', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledWith((<sinon.SinonSpy>performanceAdUnit.setDownloadStatusMessage).secondCall, 'download_error');
                                resolve();
                            }, 5);
                        });

                        it('should enable download button', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.enableDownloadButton));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe update listener', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                                resolve();
                            }, 5);
                        });

                        it('should unsubscribe ad unit close listener', (resolve) => {
                            setTimeout(() => {
                                sinon.assert.calledOnce((<sinon.SinonStub>performanceAdUnit.onClose.unsubscribe));
                                resolve();
                            }, 5);
                        });
                    });
                });

                describe('when endscreen close button is clicked', () => {
                    beforeEach((resolve) => {
                        sandbox.stub(downloadManager.onDownloadUpdate, 'unsubscribe');
                        sandbox.stub(performanceAdUnit.onClose, 'unsubscribe');
                        sandbox.stub(deviceIdManager, 'getDeviceIdsWithPermissionRequest').resolves();
                        sandbox.stub(downloadManager, 'download').resolves(1);
                        endScreenEventHandler.onEndScreenDownload(downloadParameters);
                        setTimeout(() => {
                            endScreenEventHandler.onEndScreenClose();
                            resolve();
                        }, 5);
                    });

                    it('should unsubscribe from ad unit close events', () => {
                        sinon.assert.calledOnce((<sinon.SinonSpy>performanceAdUnit.onClose.unsubscribe));
                    });

                    it('should unsubscribe from download events', () => {
                        sinon.assert.calledOnce((<sinon.SinonStub>downloadManager.onDownloadUpdate.unsubscribe));
                    });
                });
            });
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should launch intent', () => {
                const overlayContainer = overlay.container();
                if (overlayContainer && overlayContainer.parentElement) {
                    overlayContainer.parentElement.removeChild(overlayContainer);
                }
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

                    sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                        url: 'http://foo.url.com',
                        response: 'foo response',
                        responseCode: 200,
                        headers: [['location', 'market://foobar.com']]
                    }));

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                            'action': 'android.intent.action.VIEW',
                            'uri': 'market://foobar.com'
                        });
                    });
                });
            });

            it('with response that does not contain location, it should not launch intent', () => {
                const overlayContainer = overlay.container();
                if (overlayContainer && overlayContainer.parentElement) {
                    overlayContainer.parentElement.removeChild(overlayContainer);
                }
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

                    const response = TestFixtures.getOkNativeResponse();
                    response.headers = [];
                    resolvedPromise = Promise.resolve(response);
                    (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                    sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.notCalled(<sinon.SinonSpy>core.Android!.Intent.launch);
                    });
                });
            });
        });

        describe('with no follow redirects', () => {
            beforeEach(() => {
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.GOOGLE);
                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });

            it('should send a click with session manager', () => {
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });

            it('should launch market view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.Android!.Intent.launch, {
                    'action': 'android.intent.action.VIEW',
                    'uri': 'market://details?id=com.iUnity.angryBots'
                });
            });
        });

    });

    describe('with onDownloadIos', () => {
        let resolvedPromise: Promise<INativeResponse>;

        beforeEach(() => {
            platform = Platform.IOS;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            ads = TestFixtures.getAdsApi(nativeBridge);
            store = TestFixtures.getStoreApi(nativeBridge);

            storageBridge = new StorageBridge(core);
            campaign = TestFixtures.getCampaign();
            focusManager = new FocusManager(platform, core);
            container = new ViewController(core, ads, TestFixtures.getIosDeviceInfo(core), focusManager, clientInfo);
            metaDataManager = new MetaDataManager(core);
            const wakeUpManager = new WakeUpManager(core);
            const request = new RequestManager(platform, core, wakeUpManager);
            clientInfo = TestFixtures.getClientInfo(Platform.IOS);
            deviceInfo = TestFixtures.getIosDeviceInfo(core);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);
            sessionManager = new SessionManager(core, request, storageBridge);

            resolvedPromise = Promise.resolve(TestFixtures.getOkNativeResponse());

            sinon.spy(core.iOS!.UrlScheme, 'open');

            const video = new Video('', TestFixtures.getSession());
            campaign = TestFixtures.getCampaign();
            campaign.set('store', StoreName.APPLE);
            campaign.set('appStoreId', '11111');
            operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager({
                platform,
                core,
                ads,
                request: request,
                metaDataManager: metaDataManager,
                sessionManager: sessionManager,
                clientInfo: clientInfo,
                deviceInfo: deviceInfo,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                storageBridge: storageBridge,
                campaign: campaign,
                playerMetadataServerId: 'test-gamerSid'
            });

            sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);
            const privacyManager = sinon.createStubInstance(UserPrivacyManager);
            const privacy = new Privacy(platform, campaign, privacyManager, adsConfig.isGDPREnabled(), coreConfig.isCoppaCompliant());
            const endScreenParams : IEndScreenParameters = {
                platform,
                core,
                language : deviceInfo.getLanguage(),
                gameId: clientInfo.getGameId(),
                privacy: privacy,
                showGDPRBanner: false,
                abGroup: coreConfig.getAbGroup(),
                targetGameName: campaign.getGameName()
            };
            endScreen = new PerformanceEndScreen(endScreenParams, campaign);

            placement = TestFixtures.getPlacement();
            const videoOverlayParameters: IVideoOverlayParameters<Campaign> = {
                deviceInfo: deviceInfo,
                campaign: campaign,
                coreConfig: coreConfig,
                placement: placement,
                clientInfo: clientInfo,
                platform: platform,
                ads: ads
            };
            overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            const programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);

            performanceAdUnitParameters = {
                platform,
                core,
                ads,
                store,
                forceOrientation: Orientation.LANDSCAPE,
                focusManager: focusManager,
                container: container,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                placement: placement,
                campaign: campaign,
                coreConfig: coreConfig,
                adsConfig: adsConfig,
                request: request,
                options: {},
                endScreen: endScreen,
                overlay: overlay,
                video: video,
                privacy: privacy,
                privacyManager: privacyManager,
                programmaticTrackingService: programmaticTrackingService
            };

            performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);

            const storeHandlerParameters: IStoreHandlerParameters = {
                platform,
                core,
                ads,
                store,
                thirdPartyEventManager: thirdPartyEventManager,
                operativeEventManager: operativeEventManager,
                deviceInfo: deviceInfo,
                clientInfo: clientInfo,
                placement: placement,
                adUnit: performanceAdUnit,
                campaign: campaign,
                coreConfig: coreConfig
            };
            storeHandler = StoreHandlerFactory.getNewStoreHandler(storeHandlerParameters);
            endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
        });

        afterEach(() => {
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide();
        });

        it('should send a click with session manager', () => {
            sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
            performanceAdUnit.setShowing(true);
            return performanceAdUnit.hide().then(() => {
                performanceAdUnitParameters.deviceInfo = deviceInfo;
                performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });
        });

        describe('with follow redirects', () => {
            it('with response that contains location, it should open url scheme', () => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                    campaign = TestFixtures.getCampaignFollowsRedirects();
                    campaign.set('store', StoreName.APPLE);
                    performanceAdUnitParameters.campaign = TestFixtures.getCampaignFollowsRedirects();

                    sinon.stub(thirdPartyEventManager, 'clickAttributionEvent').returns(Promise.resolve({
                        url: 'http://foo.url.com',
                        response: 'foo response',
                        responseCode: 200,
                        headers: [['location', 'appstore://foobar.com']]
                    }));

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });

                    return resolvedPromise.then(() => {
                        sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'appstore://foobar.com');
                    });
                });
            });

            it('with response that does not contain location, it should not call open', () => {
                const response = TestFixtures.getOkNativeResponse();
                response.headers = [];
                resolvedPromise = Promise.resolve(response);
                (<sinon.SinonSpy>operativeEventManager.sendClick).restore();
                sinon.stub(operativeEventManager, 'sendClick').returns(resolvedPromise);

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                    bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: true,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });

                return resolvedPromise.then(() => {
                    sinon.assert.notCalled(<sinon.SinonSpy>core.iOS!.UrlScheme.open);
                });
            });

        });

        describe('with no follow redirects and OS version 8.1', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('8.1');
                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);

                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnitParameters.campaign = campaign;
                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });

            it('should launch app store view', () => {
                sinon.assert.called(<sinon.SinonSpy>core.iOS!.UrlScheme.open);
                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('with no follow redirects and bypass app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');

                campaign = TestFixtures.getCampaign();
                campaign.set('store', StoreName.APPLE);
                campaign.set('appStoreId', '11111');
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(true);
                sinon.stub(campaign, 'getStore').returns(StoreName.APPLE);
                performanceAdUnit.setShowing(true);
                return performanceAdUnit.hide().then(() => {
                    performanceAdUnitParameters.deviceInfo = deviceInfo;
                    performanceAdUnitParameters.campaign = campaign;

                    performanceAdUnit = new PerformanceAdUnit(performanceAdUnitParameters);
                    endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);

                    endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                        appStoreId: performanceAdUnitParameters.campaign.getAppStoreId(),
                        bypassAppSheet: performanceAdUnitParameters.campaign.getBypassAppSheet(),
                        store: performanceAdUnitParameters.campaign.getStore(),
                        clickAttributionUrlFollowsRedirects: performanceAdUnitParameters.campaign.getClickAttributionUrlFollowsRedirects(),
                        clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                    });
                });
            });

            it('should launch app store view', () => {
                sinon.assert.calledWith(<sinon.SinonSpy>core.iOS!.UrlScheme.open, 'https://itunes.apple.com/app/id11111');
            });

        });

        describe('open app sheet', () => {
            beforeEach(() => {
                sinon.stub(deviceInfo, 'getOsVersion').returns('9.0');

                endScreenEventHandler = new PerformanceEndScreenEventHandler(performanceAdUnit, performanceAdUnitParameters, storeHandler);
                sinon.stub(campaign, 'getClickAttributionUrlFollowsRedirects').returns(false);
                sinon.stub(campaign, 'getBypassAppSheet').returns(false);
                sinon.stub(store.iOS!.AppSheet, 'canOpen').returns(Promise.resolve(true));

                endScreenEventHandler.onEndScreenDownload(<IEndScreenDownloadParameters>{
                    appStoreId: '11111',
                    bypassAppSheet: false,
                    store: performanceAdUnitParameters.campaign.getStore(),
                    clickAttributionUrlFollowsRedirects: false,
                    clickAttributionUrl: performanceAdUnitParameters.campaign.getClickAttributionUrl()
                });
            });

            it('should open app sheet', () => {
                const resolved = Promise.resolve();
                sinon.stub(store.iOS!.AppSheet, 'present').returns(resolved);
                sinon.spy(store.iOS!.AppSheet, 'destroy');

                return new Promise((resolve, reject) => setTimeout(resolve, 500)).then(() => {
                    sinon.assert.called(<sinon.SinonSpy>store.iOS!.AppSheet.present);
                    sinon.assert.calledWith(<sinon.SinonSpy>store.iOS!.AppSheet.present, {id: 11111});
                    sinon.assert.called(<sinon.SinonSpy>store.iOS!.AppSheet.destroy);
                });
            });

            it('should send a click with session manager', () => {
                const params: IOperativeEventParams = { placement: placement,
                    videoOrientation: 'landscape',
                    adUnitStyle: undefined,
                    asset: performanceAdUnit.getVideo()
                };
                sinon.assert.calledWith(<sinon.SinonSpy>operativeEventManager.sendClick, params);
            });
        });
    });
});
