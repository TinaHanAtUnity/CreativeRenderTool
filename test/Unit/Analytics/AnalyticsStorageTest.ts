import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { NativeBridge } from 'Native/NativeBridge';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { AnalyticsStorage, IIAPInstrumentation } from 'Analytics/AnalyticsStorage';
import { StorageType } from 'Native/Api/Storage';

describe('AnalyticsStorageTest', () => {
    let nativeBridge: NativeBridge;
    let analyticsStorage: AnalyticsStorage;

    beforeEach(() => {
        nativeBridge = TestFixtures.getNativeBridge();
        analyticsStorage = new AnalyticsStorage(nativeBridge);
    });

    describe('should get analytics user id', () => {
        it('with empty storage', () => {
            const nativeId: string = '6C7FA2C0-4333-47BE-8DE2-2F24E33E710C';
            const finalId: string = '6c7fa2c0433347be8de22f24e33e710c';

            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_VALUE', 'analytics.userid']));

            return analyticsStorage.getUserId().then(id => {
                assert.equal(id, finalId, 'created analytics user id does not match');
            });
        });

        it('with no storage', () => {
            const nativeId: string = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
            const finalId: string = '6c7fa2c0433347be8de22f24e33e710c';

            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_STORAGE', StorageType.PRIVATE, 'analytics.userid']));

            return analyticsStorage.getUserId().then(id => {
                assert.equal(id, finalId, 'created analytics user id does not match');
            });
        });

        it('with existing id in storage', () => {
            const storedId: string = '9b67056f1aa44680be30df179f244211';

            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.resolve(storedId));

            return analyticsStorage.getUserId().then(id => {
                assert.equal(id, storedId, 'stored analytics id does not match');
            });
        });
    });

    describe('should get analytics session id', () => {
        it('with reinit true', () => {
            const storedId: number = 170866775104164;

            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.sessionid').returns(Promise.resolve(storedId));

            return analyticsStorage.getSessionId(true).then(id => {
                assert.equal(id, storedId, 'stored session id does not match');
            });
        });

        it('with reinit false', () => {
            const nativeId: string = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
            const analyticsId: number = 119295447155507; // first 12 hex digits converted to decimal

            sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.sessionid').callsFake(() => Promise.reject(['COULDNT_GET_VALUE', 'analytics.sessionid']));

            return analyticsStorage.getSessionId(false).then(id => {
                assert.equal(id, analyticsId, 'created session id does not match');
            });
        });
    });

    it('should get app version', () => {
        const appVersion: string = '1.2.3';

        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.appversion').returns(Promise.resolve(appVersion));

        return analyticsStorage.getAppVersion().then(version => {
            assert.equal(version, appVersion, 'stored app version does not match');
        });
    });

    it('should get OS version', () => {
        const osVersion: string = '9.8.7';

        sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.osversion').returns(Promise.resolve(osVersion));

        return analyticsStorage.getOsVersion().then(version => {
            assert.equal(version, osVersion, 'stored OS version does not match');
        });
    });

    describe('should get IAP transactions', () => {
        it('with one transaction in storage', () => {
            const transaction: IIAPInstrumentation = {
                receiptPurchaseData: 'test_purchase_data',
                'price': 1,
                'currency': 'USD',
                'signature': 'test_signature',
                'productId': 'test_id',
                'ts': 1493905891004
            };

            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve([transaction]));

            return analyticsStorage.getIAPTransactions().then(transactions => {
                assert.deepEqual(transactions[0], transaction, 'transaction data does not match');
            });
        });

        it('with three transactions in storage', () => {
            const testTransactions: IIAPInstrumentation[] = [
                {
                    receiptPurchaseData: 'first_purchase',
                    'price': 1.1,
                    'currency': 'USD',
                    'signature': 'test_signature',
                    'productId': 'test_id',
                    'ts': 1493905891001
                },
                {
                    receiptPurchaseData: 'second_purchase',
                    'price': 2.2,
                    'currency': 'USD',
                    'signature': 'test_signature',
                    'productId': 'test_id',
                    'ts': 1493905891002
                },
                {
                    receiptPurchaseData: 'third_purchase',
                    'price': 3,
                    'currency': 'USD',
                    'signature': 'test_signature',
                    'productId': 'test_id',
                    'ts': 1493905891003
                }
            ];

            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve(testTransactions));

            return analyticsStorage.getIAPTransactions().then(transactions => {
                assert.deepEqual(transactions, testTransactions, 'transaction data from three test purchases does not match');
            });
        });

        it('with empty storage', () => {
            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_VALUE', 'iap.purchases']));

            return analyticsStorage.getIAPTransactions().then(transactions => {
                assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
            });
        });

        it('with no storage', () => {
            sinon.stub(nativeBridge.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_STORAGE', StorageType.PUBLIC, 'iap.purchases']));

            return analyticsStorage.getIAPTransactions().then(transactions => {
                assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
            });
        });
    });

    it('should write ids to storage', () => {
        const userId: string = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
        const sessionId: number = 119295447155507;

        const setSpy = sinon.spy(nativeBridge.Storage, 'set');
        const writeSpy = sinon.spy(nativeBridge.Storage, 'write');

        analyticsStorage.setIds(userId, sessionId);

        assert.deepEqual(setSpy.getCall(0).args, [StorageType.PRIVATE, 'analytics.userid', userId]);
        assert.deepEqual(setSpy.getCall(1).args, [StorageType.PRIVATE, 'analytics.sessionid', sessionId]);
        assert.deepEqual(writeSpy.getCall(0).args, [StorageType.PRIVATE]);
    });

    it('should versions to storage', () => {
        const appVersion: string = '1.2.3';
        const osVersion: string = '9.8.7';

        const setSpy = sinon.spy(nativeBridge.Storage, 'set');
        const writeSpy = sinon.spy(nativeBridge.Storage, 'write');

        analyticsStorage.setVersions(appVersion, osVersion);

        assert.deepEqual(setSpy.getCall(0).args, [StorageType.PRIVATE, 'analytics.appversion', appVersion]);
        assert.deepEqual(setSpy.getCall(1).args, [StorageType.PRIVATE, 'analytics.osversion', osVersion]);
        assert.deepEqual(writeSpy.getCall(0).args, [StorageType.PRIVATE]);
    });

    it('should get integer id', () => {
        const nativeId: string = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
        const analyticsId: number = 119295447155507; // first 12 hex digits converted to decimal

        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));

        return analyticsStorage.getIntegerId().then(id => {
            assert.equal(id, analyticsId, 'integer id does not match');
        });
    });
});
