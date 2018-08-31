import { IOperativeEventManagerParams, OperativeEventManager } from 'Ads/Managers/OperativeEventManager';
import { OperativeEventManagerFactory } from 'Ads/Managers/OperativeEventManagerFactory';
import { SessionManager } from 'Ads/Managers/SessionManager';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { Campaign } from 'Ads/Models/Campaign';
import { MRAIDCampaign } from 'Ads/Models/Campaigns/MRAIDCampaign';
import { PerformanceCampaign } from 'Ads/Models/Campaigns/PerformanceCampaign';
import { Placement } from 'Ads/Models/Placement';
import { Session } from 'Ads/Models/Session';
import { assert } from 'chai';
import { Platform } from 'Common/Constants/Platform';
import { NativeBridge } from 'Common/Native/NativeBridge';
import { FocusManager } from 'Core/Managers/FocusManager';
import { MetaDataManager } from 'Core/Managers/MetaDataManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { AndroidDeviceInfo } from 'Core/Models/AndroidDeviceInfo';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { DeviceInfoApi } from 'Core/Native/DeviceInfo';
import { RequestApi } from 'Core/Native/Request';
import { StorageApi, StorageType } from 'Core/Native/Storage';
import { HttpKafka } from 'Core/Utilities/HttpKafka';

import { Request } from 'Core/Utilities/Request';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { XPromoOperativeEventManager } from 'XPromo/Managers/XPromoOperativeEventManager';

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
    let operativeEventManagerParams: IOperativeEventManagerParams<Campaign>;
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
            configuration: TestFixtures.getConfiguration(),
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
                    assert.equal(data.platform, Platform[clientInfo.getPlatform()].toLowerCase());
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
