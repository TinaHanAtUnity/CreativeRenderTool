import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { Request } from 'Utilities/Request';
import { ThirdPartyEventManager } from 'Managers/ThirdPartyEventManager';
import { StorageApi, StorageType } from 'Native/Api/Storage';
import { RequestApi } from 'Native/Api/Request';
import { NativeBridge } from 'Native/NativeBridge';
import { WakeUpManager } from 'Managers/WakeUpManager';
import { FocusManager } from 'Managers/FocusManager';
import { IOperativeEventManagerParams, OperativeEventManager } from 'Managers/OperativeEventManager';
import { ClientInfo } from 'Models/ClientInfo';
import { TestFixtures } from 'Test/Unit/TestHelpers/TestFixtures';
import { Platform } from 'Constants/Platform';
import { SessionManager } from 'Managers/SessionManager';
import { MetaDataManager } from 'Managers/MetaDataManager';
import { Session } from 'Models/Session';
import { Placement } from 'Models/Placement';
import { Campaign } from 'Models/Campaign';
import { DeviceInfoApi } from 'Native/Api/DeviceInfo';
import { AndroidDeviceInfo } from 'Models/AndroidDeviceInfo';
import { OperativeEventManagerFactory } from 'Managers/OperativeEventManagerFactory';
import { PerformanceCampaign } from 'Models/Campaigns/PerformanceCampaign';
import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';

class TestStorageApi extends StorageApi {

    private _storage = {};
    private _dirty: boolean = false;

    public set<T>(storageType: StorageType, key: string, value: T): Promise<void> {
        this._dirty = true;
        this._storage = this.setInMemoryValue(this._storage, key, value);
        return Promise.resolve(void(0));
    }

    public get<T>(storageType: StorageType, key: string): Promise<T> {
        const retValue = this.getInMemoryValue(this._storage, key);
        if(!retValue) {
            return Promise.reject(['COULDNT_GET_VALUE', key]);
        }
        return Promise.resolve(retValue);
    }

    public getKeys(storageType: StorageType, key: string, recursive: boolean): Promise<string[]> {
        return Promise.resolve(this.getInMemoryKeys(this._storage, key));
    }

    public write(storageType: StorageType): Promise<void> {
        this._dirty = false;
        return Promise.resolve(void(0));
    }

    public delete(storageType: StorageType, key: string): Promise<void> {
        this._dirty = true;
        this._storage = this.deleteInMemoryValue(this._storage, key);
        return Promise.resolve(void(0));
    }

    public isDirty(): boolean {
        return this._dirty;
    }

    private setInMemoryValue(storage: { [key: string]: any }, key: string, value: any): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.setInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'), value);
            return storage;
        } else {
            storage[keyArray[0]] = value;
            return storage;
        }
    }

    private getInMemoryValue(storage: { [key: string]: any }, key: string): any {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return null;
            }

            return this.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            return storage[key];
        }
    }

    private getInMemoryKeys(storage: { [key: string]: any }, key: string): string[] {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                return [];
            }

            return this.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
        } else {
            if(!storage[key]) {
                return [];
            }

            const retArray: string[] = [];
            for(const property in storage[key]) {
                if(storage.hasOwnProperty(key)) {
                    retArray.push(property);
                }
            }

            return retArray;
        }
    }

    private deleteInMemoryValue(storage: { [key: string]: any }, key: string): {} {
        const keyArray: string[] = key.split('.');

        if(keyArray.length > 1) {
            if(!storage[keyArray[0]]) {
                storage[keyArray[0]] = {};
            }

            storage[keyArray[0]] = this.deleteInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
            return storage;
        } else {
            delete storage[keyArray[0]];
            return storage;
        }
    }

}

class TestRequestApi extends RequestApi {

    public get(id: string, url: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }

    public post(id: string, url: string, body?: string, headers?: Array<[string, string]>): Promise<string> {
        if(url.indexOf('/fail') !== -1) {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
            }, 0);
        } else {
            setTimeout(() => {
                this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
            }, 0);
        }
        return Promise.resolve(id);
    }
}

describe('OperativeEventManagerTest', () => {
    const handleInvocation = sinon.spy();
    const handleCallback = sinon.spy();
    let nativeBridge: NativeBridge;

    let storageApi: TestStorageApi;
    let requestApi: TestRequestApi;
    let focusManager: FocusManager;
    let operativeEventManager: OperativeEventManager;
    let deviceInfo: AndroidDeviceInfo;
    let clientInfo: ClientInfo;
    let thirdPartyEventManager: ThirdPartyEventManager;
    let request: Request;
    let metaDataManager: MetaDataManager;
    let sessionManager: SessionManager;
    let operativeEventManagerParams: IOperativeEventManagerParams;
    let campaign: Campaign = TestFixtures.getCampaign();

    beforeEach(() => {
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        metaDataManager = new MetaDataManager(nativeBridge);
        focusManager = new FocusManager(nativeBridge);
        storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
        requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
        request = new Request(nativeBridge, new WakeUpManager(nativeBridge, focusManager));
        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        const wakeUpManager = new WakeUpManager(nativeBridge, focusManager);
        request = new Request(nativeBridge, wakeUpManager);
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        deviceInfo = TestFixtures.getAndroidDeviceInfo();

        thirdPartyEventManager = new ThirdPartyEventManager(nativeBridge, request);
        sessionManager = new SessionManager(nativeBridge, request);
        operativeEventManagerParams = {
            nativeBridge: nativeBridge,
            request: request,
            metaDataManager: metaDataManager,
            sessionManager: sessionManager,
            clientInfo: clientInfo,
            deviceInfo: deviceInfo,
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
            return storageApi.get<string>(StorageType.PRIVATE, urlKey).catch(error => {
                const errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event url should be deleted');
            }).then(() => {
                return storageApi.get(StorageType.PRIVATE, dataKey);
            }).catch(error => {
                const errorCode = error.shift();
                assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event data should be deleted');
            }).then(() => {
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after successful operative event');
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

        const event = operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(() => {
            assert.fail('Send failed operative event failed to fail');
        }).catch(() => {
            assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
            assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
            assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');

            const urlKey: string = 'session.' + sessionId + '.operative.' + eventId + '.url';
            const dataKey: string = 'session.' + sessionId + '.operative.' + eventId + '.data';
            return storageApi.get<string>(StorageType.PRIVATE, urlKey).then(storedUrl => {
                assert.equal(url, storedUrl, 'Failed operative event url was not correctly stored');
            }).then(() => {
                return storageApi.get<string>(StorageType.PRIVATE, dataKey);
            }).then(storedData => {
                assert.equal(data, storedData, 'Failed operative event data was not correctly stored');
                assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after failed operative event');
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
            nativeBridge.DeviceInfo = sinon.createStubInstance(DeviceInfoApi);
            requestSpy = sinon.spy(request, 'post');

            operativeEventManager.setGamerServerId('foobar');
            OperativeEventManager.setPreviousPlacementId(previousPlacementId);

            (<sinon.SinonStub>nativeBridge.DeviceInfo.getUniqueEventId).returns(Promise.resolve('42'));
            (<sinon.SinonStub>nativeBridge.DeviceInfo.getNetworkType).returns(Promise.resolve(13));
            (<sinon.SinonStub>nativeBridge.DeviceInfo.getConnectionType).returns(Promise.resolve('wifi'));
            (<sinon.SinonStub>nativeBridge.DeviceInfo.getScreenWidth).returns(Promise.resolve(1280));
            (<sinon.SinonStub>nativeBridge.DeviceInfo.getScreenHeight).returns(Promise.resolve(768));
        });

        describe('should send the proper data', () => {
            it('common data', () => {
                return operativeEventManager.sendClick(session, placement).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);

                    assert.equal(data.auctionId, session.getId());
                    assert.equal(data.gameSessionId, sessionManager.getGameSessionId());
                    assert.equal(data.gamerId, campaign.getGamerId());
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
                    assert.equal(data.platform, Platform[clientInfo.getPlatform()].toLowerCase());
                    assert.equal(data.language, deviceInfo.getLanguage());
                });
            });

            it('PerformanceCampaign specific', () => {
                return operativeEventManager.sendClick(session, placement).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, (<PerformanceCampaign>campaign).getClickUrl() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });

            it('XPromoCampaign specific', () => {
                campaign = TestFixtures.getXPromoCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick(session, placement).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, 'https://adserver.unityads.unity3d.com/mobile/campaigns/' + campaign.getId() + '/click/' + campaign.getGamerId() + '?gameId=' + clientInfo.getGameId() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });

            it('VastCampaign specific', () => {
                campaign = TestFixtures.getEventVastCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick(session, placement).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, 'https://adserver.unityads.unity3d.com/mobile/campaigns/' + campaign.getId() + '/click/' + campaign.getGamerId() + '?gameId=' + clientInfo.getGameId() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });

            it('MRAIDCampaign specific', () => {
                campaign = TestFixtures.getPlayableMRAIDCampaign();
                const params = {
                    ... operativeEventManagerParams,
                    campaign: campaign
                };

                operativeEventManager = OperativeEventManagerFactory.createOperativeEventManager(params);
                return operativeEventManager.sendClick(session, placement).then(() => {
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
                return operativeEventManager.sendClick(session, placement).then(() => {
                    assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                    const data = JSON.parse(requestSpy.getCall(0).args[1]);
                    const url = requestSpy.getCall(0).args[0];

                    assert.equal(url, 'https://adserver.unityads.unity3d.com/mobile/campaigns/' + campaign.getId() + '/click/' + campaign.getGamerId() + '?gameId=' + clientInfo.getGameId() + '&redirect=false', 'URL not what was expected');
                    assert.isDefined(data.cached, 'cached -value should be defined');
                    assert.isFalse(data.cached, 'cached -value should be false');
                });
            });
        });
    });
});
