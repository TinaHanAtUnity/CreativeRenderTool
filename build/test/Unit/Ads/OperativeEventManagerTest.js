import { OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';
import { StorageBridge } from 'Core/Utilities/StorageBridge';
import 'mocha';
import * as sinon from 'sinon';
import { StorageBridgeHelper } from 'TestHelpers/StorageBridgeHelper';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { PrivacyParser } from 'Privacy/Parsers/PrivacyParser';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
describe('OperativeEventManagerTest', () => {
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let ads;
    let storageBridge;
    let focusManager;
    let operativeEventManager;
    let deviceInfo;
    let clientInfo;
    let thirdPartyEventManager;
    let request;
    let metaDataManager;
    let sessionManager;
    let operativeEventManagerParams;
    let campaign = TestFixtures.getCampaign();
    let privacySDK;
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
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo(core);
        const configJson = ConfigurationJson;
        privacySDK = PrivacyParser.parse(configJson, clientInfo, deviceInfo);
        const userPrivacyManager = new UserPrivacyManager(platform, core, TestFixtures.getCoreConfiguration(), TestFixtures.getAdsConfiguration(), clientInfo, deviceInfo, request, privacySDK);
        thirdPartyEventManager = new ThirdPartyEventManager(core, request);
        sessionManager = new SessionManager(core, request, storageBridge);
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
            campaign: campaign,
            playerMetadataServerId: 'test-gamerSid',
            privacySDK: privacySDK,
            userPrivacyManager: userPrivacyManager
        };
        operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
    });
    it('Send successful operative event', () => {
        const eventId = '1234';
        const sessionId = '5678';
        const url = 'https://www.example.net/operative_event';
        const data = 'Test data';
        const requestSpy = sinon.stub(request, 'post').returns(Promise.resolve(TestFixtures.getOkNativeResponse()));
        return operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(() => {
            assert(requestSpy.calledOnce, 'Operative event did not send POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');
            const urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
            const dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return core.Storage.get(StorageType.PRIVATE, urlKey).catch(error => {
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
        const eventId = '1234';
        const sessionId = '5678';
        const url = 'https://www.example.net/fail';
        const data = 'Test data';
        const requestSpy = sinon.spy(request, 'post');
        const storagePromise = StorageBridgeHelper.waitForPrivateStorageBatch(storageBridge);
        const event = operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(() => {
            assert.fail('Send failed operative event failed to fail');
        }).catch(() => {
            assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');
            const urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
            const dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return storagePromise.then(() => {
                return core.Storage.get(StorageType.PRIVATE, urlKey);
            }).then(storedUrl => {
                assert.equal(url + '?eventRetry=true', storedUrl, 'Failed operative event url was not correctly stored');
            }).then(() => {
                return core.Storage.get(StorageType.PRIVATE, dataKey);
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
        const url = 'https://www.example.net/third_party_event';
        const requestSpy = sinon.spy(request, 'get');
        return thirdPartyEventManager.clickAttributionEvent(url, false).then(() => {
            assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
        });
    });
    describe('sending clicks', () => {
        let placement;
        let session;
        let requestSpy;
        const uniqueEventID = '42';
        const previousPlacementId = 'foobar1';
        beforeEach(() => {
            placement = TestFixtures.getPlacement();
            session = TestFixtures.getSession();
            session.setGameSessionCounters(TestFixtures.getGameSessionCounters());
            campaign = TestFixtures.getCampaign();
            core.DeviceInfo = sinon.createStubInstance(DeviceInfoApi);
            requestSpy = sinon.spy(request, 'post');
            OperativeEventManager.setPreviousPlacementId(previousPlacementId);
            core.DeviceInfo.getUniqueEventId.returns(Promise.resolve('42'));
            core.DeviceInfo.getNetworkType.returns(Promise.resolve(13));
            core.DeviceInfo.getConnectionType.returns(Promise.resolve('wifi'));
            core.DeviceInfo.getScreenWidth.returns(Promise.resolve(1280));
            core.DeviceInfo.getScreenHeight.returns(Promise.resolve(768));
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
                    assert.equal(data.sid, 'test-gamerSid');
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
                    assert.equal(url, campaign.getClickUrl() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });
            // FIXME: Test pollution causes HttpKafka to be corrupted during this test.
            xit('XPromoCampaign specific', () => {
                campaign = TestFixtures.getXPromoCampaign(session);
                const params = Object.assign({}, operativeEventManagerParams, { campaign: campaign });
                const xPromoOperativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                HttpKafka.setRequest(request);
                return xPromoOperativeEventManager.sendClick({ placement: placement, videoOrientation: 'landscape' }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const url = requestSpy.getCall(0).args[0];
                    assert.equal(url, 'https://httpkafka.unityads.unity3d.com/v1/events', 'URL not what was expected');
                    const data = JSON.parse(requestSpy.getCall(0).args[1].split('\n')[1]);
                    assert.exists(data.msg.creativePackId);
                    assert.exists(data.msg.targetStoreId);
                    assert.equal(data.msg.creativePackId, TestFixtures.getXPromoCampaign().getCreativeId());
                    assert.equal(data.msg.targetStoreId, TestFixtures.getXPromoCampaign().getAppStoreId());
                });
            });
            it('VastCampaign specific', () => {
                campaign = TestFixtures.getEventVastCampaign(session);
                const params = Object.assign({}, operativeEventManagerParams, { campaign: campaign });
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.notCalled, 'Operative event did send POST request');
                });
            });
            it('MRAIDCampaign specific', () => {
                campaign = TestFixtures.getExtendedMRAIDCampaign(session);
                const params = Object.assign({}, operativeEventManagerParams, { campaign: campaign });
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];
                    assert.equal(url, campaign.getClickUrl() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });
            it('DisplayInterstitialCampaign specific', () => {
                campaign = TestFixtures.getDisplayInterstitialCampaign(session);
                const params = Object.assign({}, operativeEventManagerParams, { campaign: campaign });
                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick({ placement: placement }).then(() => {
                    assert(requestSpy.notCalled, 'Operative event did send POST request');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Rlc3QvVW5pdC9BZHMvT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQWdDLHFCQUFxQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDekcsT0FBTyxFQUFFLDRCQUE0QixFQUFFLE1BQU0sMkNBQTJDLENBQUM7QUFDekYsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQzdELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSzdFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRW5ELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFFaEUsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzlELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUk1RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDdkQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUNyRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxPQUFPLENBQUM7QUFHZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxpQ0FBaUMsQ0FBQztBQUN0RSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFHeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQzlELE9BQU8saUJBQWlCLE1BQU0sbUNBQW1DLENBQUM7QUFDbEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFFckUsUUFBUSxDQUFDLDJCQUEyQixFQUFFLEdBQUcsRUFBRTtJQUN2QyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQWMsQ0FBQztJQUNuQixJQUFJLEdBQVksQ0FBQztJQUNqQixJQUFJLGFBQTRCLENBQUM7SUFDakMsSUFBSSxZQUEwQixDQUFDO0lBQy9CLElBQUkscUJBQTRDLENBQUM7SUFDakQsSUFBSSxVQUE2QixDQUFDO0lBQ2xDLElBQUksVUFBc0IsQ0FBQztJQUMzQixJQUFJLHNCQUE4QyxDQUFDO0lBQ25ELElBQUksT0FBdUIsQ0FBQztJQUM1QixJQUFJLGVBQWdDLENBQUM7SUFDckMsSUFBSSxjQUE4QixDQUFDO0lBQ25DLElBQUksMkJBQW1FLENBQUM7SUFDeEUsSUFBSSxRQUFRLEdBQWEsWUFBWSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3BELElBQUksVUFBc0IsQ0FBQztJQUUzQixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ1osUUFBUSxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUM7UUFDNUIsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDNUMsWUFBWSxHQUFHLFlBQVksQ0FBQyxlQUFlLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQy9ELElBQUksR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzdDLEdBQUcsR0FBRyxZQUFZLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRTNDLGFBQWEsR0FBRyxJQUFJLGFBQWEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0MsZUFBZSxHQUFHLElBQUksZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLFlBQVksR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEQsT0FBTyxHQUFHLElBQUksY0FBYyxDQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUN0RSxzQkFBc0IsR0FBRyxJQUFJLHNCQUFzQixDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRSxVQUFVLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUQsVUFBVSxHQUFHLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNyRCxNQUFNLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQztRQUNyQyxVQUFVLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxRQUFRLEVBQUUsSUFBSSxFQUFFLFlBQVksQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLFlBQVksQ0FBQyxtQkFBbUIsRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRXhMLHNCQUFzQixHQUFHLElBQUksc0JBQXNCLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ25FLGNBQWMsR0FBRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ2xFLDJCQUEyQixHQUFHO1lBQzFCLFFBQVE7WUFDUixJQUFJO1lBQ0osR0FBRztZQUNILE9BQU8sRUFBRSxPQUFPO1lBQ2hCLGVBQWUsRUFBRSxlQUFlO1lBQ2hDLGNBQWMsRUFBRSxjQUFjO1lBQzlCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLFVBQVUsRUFBRSxZQUFZLENBQUMsb0JBQW9CLEVBQUU7WUFDL0MsU0FBUyxFQUFFLFlBQVksQ0FBQyxtQkFBbUIsRUFBRTtZQUM3QyxhQUFhLEVBQUUsYUFBYTtZQUM1QixRQUFRLEVBQUUsUUFBUTtZQUNsQixzQkFBc0IsRUFBRSxlQUFlO1lBQ3ZDLFVBQVUsRUFBRSxVQUFVO1lBQ3RCLGtCQUFrQixFQUFFLGtCQUFrQjtTQUN6QyxDQUFDO1FBQ0YscUJBQXFCLEdBQUcsNEJBQTRCLENBQUMsMkJBQTJCLENBQUMsMkJBQTJCLENBQUMsQ0FBQztJQUNsSCxDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxpQ0FBaUMsRUFBRSxHQUFHLEVBQUU7UUFDdkMsTUFBTSxPQUFPLEdBQVcsTUFBTSxDQUFDO1FBQy9CLE1BQU0sU0FBUyxHQUFXLE1BQU0sQ0FBQztRQUNqQyxNQUFNLEdBQUcsR0FBVyx5Q0FBeUMsQ0FBQztRQUM5RCxNQUFNLElBQUksR0FBVyxXQUFXLENBQUM7UUFFakMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLG1CQUFtQixFQUFFLENBQUMsQ0FBQyxDQUFDO1FBRTVHLE9BQU8scUJBQXFCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3BGLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7WUFDM0UsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsb0NBQW9DLENBQUMsQ0FBQztZQUN2RixNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO1lBRXpGLE1BQU0sTUFBTSxHQUFXLFVBQVUsR0FBRyxTQUFTLEdBQUcsYUFBYSxHQUFHLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDakYsTUFBTSxPQUFPLEdBQVcsVUFBVSxHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsT0FBTyxHQUFHLE9BQU8sQ0FBQztZQUNuRixPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFTLFdBQVcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUN2RSxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7Z0JBQ2hDLE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxFQUFFLGtEQUFrRCxDQUFDLENBQUM7WUFDckcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUQsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUNiLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLEVBQUUsbURBQW1ELENBQUMsQ0FBQztZQUN0RyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLG1FQUFtRSxDQUFDLENBQUM7WUFDNUgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtRQUNuQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFcEMsTUFBTSxPQUFPLEdBQVcsTUFBTSxDQUFDO1FBQy9CLE1BQU0sU0FBUyxHQUFXLE1BQU0sQ0FBQztRQUNqQyxNQUFNLEdBQUcsR0FBVyw4QkFBOEIsQ0FBQztRQUNuRCxNQUFNLElBQUksR0FBVyxXQUFXLENBQUM7UUFFakMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFOUMsTUFBTSxjQUFjLEdBQUcsbUJBQW1CLENBQUMsMEJBQTBCLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFckYsTUFBTSxLQUFLLEdBQUcscUJBQXFCLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQzNGLE1BQU0sQ0FBQyxJQUFJLENBQUMsNENBQTRDLENBQUMsQ0FBQztRQUM5RCxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFO1lBQ1YsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUseURBQXlELENBQUMsQ0FBQztZQUN6RixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO1lBQ3ZGLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLHFDQUFxQyxDQUFDLENBQUM7WUFFekYsTUFBTSxNQUFNLEdBQVcsVUFBVSxHQUFHLFNBQVMsR0FBRyxhQUFhLEdBQUcsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNqRixNQUFNLE9BQU8sR0FBVyxVQUFVLEdBQUcsU0FBUyxHQUFHLGFBQWEsR0FBRyxPQUFPLEdBQUcsT0FBTyxDQUFDO1lBQ25GLE9BQU8sY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQzVCLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQVMsV0FBVyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztZQUNqRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ2hCLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxxREFBcUQsQ0FBQyxDQUFDO1lBQzdHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ1QsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBUyxXQUFXLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2xFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDakIsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsVUFBVSxFQUFFLHNEQUFzRCxDQUFDLENBQUM7Z0JBQ3ZGLE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLCtEQUErRCxDQUFDLENBQUM7WUFDeEgsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDbEIsS0FBSyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2hCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtRQUNwQyxNQUFNLEdBQUcsR0FBVywyQ0FBMkMsQ0FBQztRQUVoRSxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUU3QyxPQUFPLHNCQUFzQixDQUFDLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO1lBQ3RFLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLHlEQUF5RCxDQUFDLENBQUM7WUFDekYsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsNENBQTRDLENBQUMsQ0FBQztRQUNuRyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0lBRUgsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTtRQUM1QixJQUFJLFNBQW9CLENBQUM7UUFDekIsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksVUFBZSxDQUFDO1FBQ3BCLE1BQU0sYUFBYSxHQUFHLElBQUksQ0FBQztRQUMzQixNQUFNLG1CQUFtQixHQUFHLFNBQVMsQ0FBQztRQUV0QyxVQUFVLENBQUMsR0FBRyxFQUFFO1lBQ1osU0FBUyxHQUFHLFlBQVksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN4QyxPQUFPLEdBQUcsWUFBWSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3BDLE9BQU8sQ0FBQyxzQkFBc0IsQ0FBQyxZQUFZLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDO1lBQ3RFLFFBQVEsR0FBRyxZQUFZLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDdEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7WUFDMUQsVUFBVSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRXhDLHFCQUFxQixDQUFDLHNCQUFzQixDQUFDLG1CQUFtQixDQUFDLENBQUM7WUFFaEQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBaUIsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQ2pFLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxpQkFBa0IsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3BFLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBZSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDL0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFnQixDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDckYsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO1lBQ3pDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO2dCQUNuQixPQUFPLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7b0JBQzNFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFdkQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUM5QyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsY0FBYyxDQUFDLGdCQUFnQixFQUFFLENBQUMsQ0FBQztvQkFDcEUsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNoRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUM7b0JBQ2hELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7b0JBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztvQkFDaEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDO29CQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7b0JBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLHFCQUFxQixFQUFFLFVBQVUsQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLENBQUM7b0JBQ2hGLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGVBQWUsRUFBRSxVQUFVLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO29CQUNwRSxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7b0JBQ3hELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxlQUFlLENBQUMsQ0FBQztvQkFDeEMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLFVBQVUsQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO29CQUM1RCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQ3RELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztvQkFDMUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsbUJBQW1CLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7b0JBQzdELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztvQkFDNUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7b0JBQ2hFLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQztvQkFDNUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO29CQUM5RCxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7Z0JBQzFELENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO2dCQUNwQyxPQUFPLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7b0JBQzNFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUF3QixRQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDbEgsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7b0JBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO2dCQUNqRSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsMkVBQTJFO1lBQzNFLEdBQUcsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7Z0JBQ2hDLFFBQVEsR0FBRyxZQUFZLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25ELE1BQU0sTUFBTSxxQkFDSiwyQkFBMkIsSUFDL0IsUUFBUSxFQUFFLFFBQVEsR0FDckIsQ0FBQztnQkFFRixNQUFNLDJCQUEyQixHQUFnQyw0QkFBNEIsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEksU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDOUIsT0FBTywyQkFBMkIsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDNUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxVQUFVLEVBQUUsMkNBQTJDLENBQUMsQ0FBQztvQkFDM0UsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLGtEQUFrRCxFQUFFLDJCQUEyQixDQUFDLENBQUM7b0JBQ25HLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQVUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFFLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hGLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLENBQUMsQ0FBQztvQkFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyxDQUFDO29CQUN0QyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsY0FBYyxFQUFFLFlBQVksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUM7b0JBQ3hGLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsWUFBWSxDQUFDLGlCQUFpQixFQUFFLENBQUMsYUFBYSxFQUFFLENBQUMsQ0FBQztnQkFDM0YsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx1QkFBdUIsRUFBRSxHQUFHLEVBQUU7Z0JBQzdCLFFBQVEsR0FBRyxZQUFZLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RELE1BQU0sTUFBTSxxQkFDSiwyQkFBMkIsSUFDL0IsUUFBUSxFQUFFLFFBQVEsR0FDckIsQ0FBQztnQkFFRixxQkFBcUIsR0FBRyw0QkFBNEIsQ0FBQywyQkFBMkIsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDekYsT0FBTyxxQkFBcUIsQ0FBQyxTQUFTLENBQUMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFO29CQUN2RSxNQUFNLENBQUMsVUFBVSxDQUFDLFNBQVMsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO2dCQUMxRSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHdCQUF3QixFQUFFLEdBQUcsRUFBRTtnQkFDOUIsUUFBUSxHQUFHLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUQsTUFBTSxNQUFNLHFCQUNKLDJCQUEyQixJQUMvQixRQUFRLEVBQUUsUUFBUSxHQUNyQixDQUFDO2dCQUVGLHFCQUFxQixHQUFHLDRCQUE0QixDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RixPQUFPLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLE1BQU0sQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLDJDQUEyQyxDQUFDLENBQUM7b0JBQzNFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkQsTUFBTSxHQUFHLEdBQUcsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRTFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFrQixRQUFTLENBQUMsV0FBVyxFQUFFLEdBQUcsaUJBQWlCLEVBQUUsMkJBQTJCLENBQUMsQ0FBQztvQkFDNUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLGlDQUFpQyxDQUFDLENBQUM7b0JBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSwrQkFBK0IsQ0FBQyxDQUFDO2dCQUNqRSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtnQkFDNUMsUUFBUSxHQUFHLFlBQVksQ0FBQyw4QkFBOEIsQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDaEUsTUFBTSxNQUFNLHFCQUNKLDJCQUEyQixJQUMvQixRQUFRLEVBQUUsUUFBUSxHQUNyQixDQUFDO2dCQUVGLHFCQUFxQixHQUFHLDRCQUE0QixDQUFDLDJCQUEyQixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUN6RixPQUFPLHFCQUFxQixDQUFDLFNBQVMsQ0FBQyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7b0JBQ3ZFLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxFQUFFLHVDQUF1QyxDQUFDLENBQUM7Z0JBQzFFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==