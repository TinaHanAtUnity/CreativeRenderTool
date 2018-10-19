import { IOperativeEventManagerParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { RequestApi } from 'Core/Native/Request';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';

import { RequestManager } from 'Core/Managers/RequestManager';
import 'mocha';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import { Backend } from '../../src/ts/Backend/Backend';
import { ICoreApi } from '../../src/ts/Core/ICore';
import { IAdsApi } from '../../src/ts/Ads/IAds';

class TestHelper {
    public static waitForStorageBatch(storageBridge: StorageBridge): Promise<void> {
        return new Promise((resolve, reject) => {
            const storageObserver = () => {
                storageBridge.onPrivateStorageWrite.unsubscribe(storageObserver);
                resolve();
            };
            storageBridge.onPrivateStorageWrite.subscribe(storageObserver);
        });
    }
}

describe('OperativeEventManagerTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let storageBridge: StorageBridge;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: AndroidDeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: RequestManager;
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;
    let operativeEventManagerParams: IOperativeEventManagerParams<Campaign>;
    let campaign: Campaign = TestFixtures.getCampaign();

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        storageBridge = new StorageBridge(core, 1);
        metaDataManager = new MetaDataManager(core);
        focusManager = new FocusManager(platform, core);
        request = new RequestManager(platform, core, new WakeUpManager(core));
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        const wakeUpManager = new WakeUpManager(core);
        request = new RequestManager(platform, core, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);

        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core.Storage, request, storageBridge);
        operativeEventManagerParams = {
            platform,
            core,
            ads,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
            coreConfig: TestFixtures.getCoreConfiguration(),
            adsConfig: TestFixtures.getAdsConfiguration(),
            storageBridge: storageBridge,
            campaign: campaign
        };
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
    });

    it('Send successful operative event', () => {
        const eventId: string = '1234';
        const sessionId: string = '5678';
        const url: string = 'https://www.example.net/operative_event';
        const data: string = 'Test data';

        const requestSpy = sinon.spy(request, 'post');

        return operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(() => {
            assert(requestSpy.calledOnce, 'Operative event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            const urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            const dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return core.Storage.get<string>(StorageType.PRIVATE, urlKey).catch(error => {
                const errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event url should be deleted');
            }).then(() => {
                return core.Storage.get(StorageType.PRIVATE, dataKey);
            }).catch(error => {
                const errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event data should be deleted');
            }).then(() => {
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after successful operative event');
            });
        });
    });

    it('Send failed operative event', () => {
        const clock = sinon.useFakeTimers();

        const eventId: string = '1234';
        const sessionId: string = '5678';
        const url: string = 'https://www.example.net/fail';
        const data: string = 'Test data';

        const requestSpy = sinon.spy(request, 'post');

        const storagePromise = TestHelper.waitForStorageBatch(storageBridge);

        const event = operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(() => {
            assert.fail('Send failed operative event failed to fail');
        }).catch(() => {
            assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            const urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            const dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return storagePromise.then(() => {
                return core.Storage.get<string>(StorageType.PRIVATE, urlKey);
            }).then(storedUrl => {
                assert.equal(url, storedUrl, 'Failed operative event url was not correctly stored');
            }).then(() => {
                return core.Storage.get<string>(StorageType.PRIVATE, dataKey);
            }).then(storedData => {
                assert.equal(data, storedData, 'Failed operative event data was not correctly stored');
                assert.equal(false, backend.Api.Storage.isDirty(), 'Storage should not be left dirty after failed operative event');
            });
        });
        clock.tick(30000);
        clock.restore();
        return event;
    });

    it('Send click attribution event', () => {
        const url: string = 'https://www.example.net/third_party_event';

        const requestSpy = sinon.spy(request, 'get');

        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });

    describe('sending clicks', () => {
        let placement: Placement;
        let session: Session;
        let requestSpy: any;
        const uniqueEventID = '42';
        const gamerSid = 'foobar';
        const previousPlacementId = 'foobar1';

        beforeEach(() => {
            placement = TestFixtures.getPlacement();
            session = TestFixtures.getSession();
            campaign = TestFixtures.getCampaign();
            core.DeviceInfo = sinon.createStubInstance(DeviceInfoApi);
            requestSpy = sinon.spy(request, 'post');

            operativeEventManager.setGamerServerId('foobar');
            OperativeEventManager.setPreviousPlacementId(previousPlacementId);

            (<sinon.SinonStub>core.DeviceInfo.getUniqueEventId).returns(Promise.resolve('42'));
            (<sinon.SinonStub>core.DeviceInfo.getNetworkType).returns(Promise.resolve(13));
            (<sinon.SinonStub>core.DeviceInfo.getConnectionType).returns(Promise.resolve('wifi'));
            (<sinon.SinonStub>core.DeviceInfo.getScreenWidth).returns(Promise.resolve(1280));
            (<sinon.SinonStub>core.DeviceInfo.getScreenHeight).returns(Promise.resolve(768));
        });

        describe('should send the proper data', () => {
            it('common data', () => {
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);

                    assert.equal(data.auctionId, session.getId());
                    assert.equal(data.gameSessionId, sessionManager.getGameSessionId());
                    assert.equal(data.campaignId, campaign.getId());
                    assert.equal(data.adType, campaign.getAdType());
                    assert.equal(data.correlationId, campaign.getCorrelationId());
                    assert.equal(data.creativeId, campaign.getCreativeId());
                    assert.equal(data.seatId, campaign.getSeatId());
                    assert.equal(data.placementId, placement.getId());
                    assert.equal(data.apiLevel, deviceInfo.getApiLevel());
                    assert.equal(data.advertisingTrackingId, deviceInfo.getAdvertisingIdentifier());
                    assert.equal(data.limitAdTracking, deviceInfo.getLimitAdTracking());
                    assert.equal(data.osVersion, deviceInfo.getOsVersion());
                    assert.equal(data.sid, gamerSid);
                    assert.equal(data.deviceMake, deviceInfo.getManufacturer());
                    assert.equal(data.deviceModel, deviceInfo.getModel());
                    assert.equal(data.sdkVersion, clientInfo.getSdkVersion());
                    assert.equal(data.previousPlacementId, previousPlacementId);
                    assert.equal(data.bundleId, clientInfo.getApplicationName());
                    assert.equal(data.meta, campaign.getMeta());
                    assert.equal(data.screenDensity, deviceInfo.getScreenDensity());
                    assert.equal(data.screenSize, deviceInfo.getScreenLayout());
                    assert.equal(data.platform, Platform[platform].toLowerCase());
                    assert.equal(data.language, deviceInfo.getLanguage());
                });
            });

            it('PerformanceCampaign specific', () => {
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, (<PerformanceCampaign>campaign).getClickUrl() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });

            it('XPromoCampaign specific', () => {
                HttpKafka.setRequest(request);
                campaign = TestFixtures.getXPromoCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                const xPromoOperativeEventManager = <XPromoOperativeEventManager>OperativeEventManagerFactory.createOperativeEventManager(params);
                HttpKafka.setRequest(request);
                return xPromoOperativeEventManager.sendClick({ placement: placement, videoOrientation: 'landscape' }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const url = requestSpy.getCall(0).args[0];
                    assert.equal(url, 'https://httpkafka.unityads.unity3d.com/v1/events', 'URL not what was expected');
                    const data = JSON.parse((<string>requestSpy.getCall(0).args[1]).split('\n')[1]);
                    assert.exists(data.msg.creativePackId);
                    assert.exists(data.msg.targetStoreId);
                    assert.equal(data.msg.creativePackId, TestFixtures.getXPromoCampaign().getCreativeId());
                    assert.equal(data.msg.targetStoreId, TestFixtures.getXPromoCampaign().getAppStoreId());
                });
            });

            it('VastCampaign specific', () => {
                campaign = TestFixtures.getEventVastCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.notCalled, 'Operative event did send POST request');
                });
            });

            it('MRAIDCampaign specific', () => {
                campaign = TestFixtures.getPlayableMRAIDCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, (<MRAIDCampaign>campaign).getClickUrl() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });

            it('DisplayInterstitialCampaign specific', () => {
                campaign = TestFixtures.getDisplayInterstitialCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.notCalled, 'Operative event did send POST request');
                });
            });
        });
    });
});
