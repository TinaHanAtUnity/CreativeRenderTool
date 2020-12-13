import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { StorageType } from 'Core/Native/Storage';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('AnalyticsStorageTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let analyticsStorage;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            analyticsStorage = new AnalyticsStorage(core);
        });
        describe('should get analytics user id', () => {
            it('with empty storage', () => {
                const nativeId = '6C7FA2C0-4333-47BE-8DE2-2F24E33E710C';
                const finalId = '6c7fa2c0433347be8de22f24e33e710c';
                sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_VALUE', 'analytics.userid']));
                return analyticsStorage.getUserId().then(id => {
                    assert.equal(id, finalId, 'created analytics user id does not match');
                });
            });
            it('with no storage', () => {
                const nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                const finalId = '6c7fa2c0433347be8de22f24e33e710c';
                sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_STORAGE', StorageType.PRIVATE, 'analytics.userid']));
                return analyticsStorage.getUserId().then(id => {
                    assert.equal(id, finalId, 'created analytics user id does not match');
                });
            });
            it('with existing id in storage', () => {
                const storedId = '9b67056f1aa44680be30df179f244211';
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.userid').returns(Promise.resolve(storedId));
                return analyticsStorage.getUserId().then(id => {
                    assert.equal(id, storedId, 'stored analytics id does not match');
                });
            });
        });
        describe('should get analytics session id', () => {
            it('with reinit true', () => {
                const storedId = 170866775104164;
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.sessionid').returns(Promise.resolve(storedId));
                return analyticsStorage.getSessionId(true).then(id => {
                    assert.equal(id, storedId, 'stored session id does not match');
                });
            });
            it('with reinit false', () => {
                const nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                const analyticsId = 119295447155507; // first 12 hex digits converted to decimal
                sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.sessionid').callsFake(() => Promise.reject(['COULDNT_GET_VALUE', 'analytics.sessionid']));
                return analyticsStorage.getSessionId(false).then(id => {
                    assert.equal(id, analyticsId, 'created session id does not match');
                });
            });
        });
        it('should get app version', () => {
            const appVersion = '1.2.3';
            sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.appversion').returns(Promise.resolve(appVersion));
            return analyticsStorage.getAppVersion().then(version => {
                assert.equal(version, appVersion, 'stored app version does not match');
            });
        });
        it('should get OS version', () => {
            const osVersion = '9.8.7';
            sinon.stub(core.Storage, 'get').withArgs(StorageType.PRIVATE, 'analytics.osversion').returns(Promise.resolve(osVersion));
            return analyticsStorage.getOsVersion().then(version => {
                assert.equal(version, osVersion, 'stored OS version does not match');
            });
        });
        describe('should get IAP transactions', () => {
            it('with one transaction in storage', () => {
                const transaction = {
                    receiptPurchaseData: 'test_purchase_data',
                    'price': 1,
                    'currency': 'USD',
                    'signature': 'test_signature',
                    'productId': 'test_id',
                    'ts': 1493905891004
                };
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve([transaction]));
                return analyticsStorage.getIAPTransactions().then(transactions => {
                    assert.deepEqual(transactions[0], transaction, 'transaction data does not match');
                });
            });
            it('with three transactions in storage', () => {
                const testTransactions = [
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
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve(testTransactions));
                return analyticsStorage.getIAPTransactions().then(transactions => {
                    assert.deepEqual(transactions, testTransactions, 'transaction data from three test purchases does not match');
                });
            });
            it('with empty storage', () => {
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_VALUE', 'iap.purchases']));
                return analyticsStorage.getIAPTransactions().then(transactions => {
                    assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
                });
            });
            it('with no storage', () => {
                sinon.stub(core.Storage, 'get').withArgs(StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_STORAGE', StorageType.PUBLIC, 'iap.purchases']));
                return analyticsStorage.getIAPTransactions().then(transactions => {
                    assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
                });
            });
        });
        it('should write ids to storage', () => {
            const userId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
            const sessionId = 119295447155507;
            const setSpy = sinon.spy(core.Storage, 'set');
            const writeSpy = sinon.spy(core.Storage, 'write');
            analyticsStorage.setIds(userId, sessionId);
            assert.deepEqual(setSpy.getCall(0).args, [StorageType.PRIVATE, 'analytics.userid', userId]);
            assert.deepEqual(setSpy.getCall(1).args, [StorageType.PRIVATE, 'analytics.sessionid', sessionId]);
            assert.deepEqual(writeSpy.getCall(0).args, [StorageType.PRIVATE]);
        });
        it('should versions to storage', () => {
            const appVersion = '1.2.3';
            const osVersion = '9.8.7';
            const setSpy = sinon.spy(core.Storage, 'set');
            const writeSpy = sinon.spy(core.Storage, 'write');
            analyticsStorage.setVersions(appVersion, osVersion);
            assert.deepEqual(setSpy.getCall(0).args, [StorageType.PRIVATE, 'analytics.appversion', appVersion]);
            assert.deepEqual(setSpy.getCall(1).args, [StorageType.PRIVATE, 'analytics.osversion', osVersion]);
            assert.deepEqual(writeSpy.getCall(0).args, [StorageType.PRIVATE]);
        });
        it('should get integer id', () => {
            const nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
            const analyticsId = 119295447155507; // first 12 hex digits converted to decimal
            sinon.stub(core.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
            return analyticsStorage.getIntegerId().then(id => {
                assert.equal(id, analyticsId, 'integer id does not match');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzU3RvcmFnZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvQW5hbHl0aWNzL0FuYWx5dGljc1N0b3JhZ2VUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxnQkFBZ0IsRUFBdUIsTUFBTSw0QkFBNEIsQ0FBQztBQUVuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBQzlCLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUluRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDbEQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFFeEQsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtRQUNsQyxJQUFJLE9BQWdCLENBQUM7UUFDckIsSUFBSSxZQUEwQixDQUFDO1FBQy9CLElBQUksSUFBYyxDQUFDO1FBQ25CLElBQUksZ0JBQWtDLENBQUM7UUFFdkMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRCxJQUFJLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QyxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtZQUMxQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsR0FBRyxFQUFFO2dCQUMxQixNQUFNLFFBQVEsR0FBVyxzQ0FBc0MsQ0FBQztnQkFDaEUsTUFBTSxPQUFPLEdBQVcsa0NBQWtDLENBQUM7Z0JBRTNELEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXJKLE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUMxQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsMENBQTBDLENBQUMsQ0FBQztnQkFDMUUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3ZCLE1BQU0sUUFBUSxHQUFXLHNDQUFzQyxDQUFDO2dCQUNoRSxNQUFNLE9BQU8sR0FBVyxrQ0FBa0MsQ0FBQztnQkFFM0QsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDbkYsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUU1SyxPQUFPLGdCQUFnQixDQUFDLFNBQVMsRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDMUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7Z0JBQzFFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsNkJBQTZCLEVBQUUsR0FBRyxFQUFFO2dCQUNuQyxNQUFNLFFBQVEsR0FBVyxrQ0FBa0MsQ0FBQztnQkFFNUQsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFFckgsT0FBTyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUU7b0JBQzFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxvQ0FBb0MsQ0FBQyxDQUFDO2dCQUNyRSxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO1lBQzdDLEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7Z0JBQ3hCLE1BQU0sUUFBUSxHQUFXLGVBQWUsQ0FBQztnQkFFekMsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFFeEgsT0FBTyxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFO29CQUNqRCxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztnQkFDbkUsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7Z0JBQ3pCLE1BQU0sUUFBUSxHQUFXLHNDQUFzQyxDQUFDO2dCQUNoRSxNQUFNLFdBQVcsR0FBVyxlQUFlLENBQUMsQ0FBQywyQ0FBMkM7Z0JBRXhGLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7Z0JBQ25GLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxxQkFBcUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRW5LLE9BQU8sZ0JBQWdCLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDbEQsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7Z0JBQ3ZFLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7WUFDOUIsTUFBTSxVQUFVLEdBQVcsT0FBTyxDQUFDO1lBRW5DLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFFM0gsT0FBTyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ25ELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO1lBQzNFLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO1lBQzdCLE1BQU0sU0FBUyxHQUFXLE9BQU8sQ0FBQztZQUVsQyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxPQUFPLEVBQUUscUJBQXFCLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBRXpILE9BQU8sZ0JBQWdCLENBQUMsWUFBWSxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUNsRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsa0NBQWtDLENBQUMsQ0FBQztZQUN6RSxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLDZCQUE2QixFQUFFLEdBQUcsRUFBRTtZQUN6QyxFQUFFLENBQUMsaUNBQWlDLEVBQUUsR0FBRyxFQUFFO2dCQUN2QyxNQUFNLFdBQVcsR0FBd0I7b0JBQ3JDLG1CQUFtQixFQUFFLG9CQUFvQjtvQkFDekMsT0FBTyxFQUFFLENBQUM7b0JBQ1YsVUFBVSxFQUFFLEtBQUs7b0JBQ2pCLFdBQVcsRUFBRSxnQkFBZ0I7b0JBQzdCLFdBQVcsRUFBRSxTQUFTO29CQUN0QixJQUFJLEVBQUUsYUFBYTtpQkFDdEIsQ0FBQztnQkFFRixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRXRILE9BQU8sZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7b0JBQzdELE1BQU0sQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLFdBQVcsRUFBRSxpQ0FBaUMsQ0FBQyxDQUFDO2dCQUN0RixDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLEdBQUcsRUFBRTtnQkFDMUMsTUFBTSxnQkFBZ0IsR0FBMEI7b0JBQzVDO3dCQUNJLG1CQUFtQixFQUFFLGdCQUFnQjt3QkFDckMsT0FBTyxFQUFFLEdBQUc7d0JBQ1osVUFBVSxFQUFFLEtBQUs7d0JBQ2pCLFdBQVcsRUFBRSxnQkFBZ0I7d0JBQzdCLFdBQVcsRUFBRSxTQUFTO3dCQUN0QixJQUFJLEVBQUUsYUFBYTtxQkFDdEI7b0JBQ0Q7d0JBQ0ksbUJBQW1CLEVBQUUsaUJBQWlCO3dCQUN0QyxPQUFPLEVBQUUsR0FBRzt3QkFDWixVQUFVLEVBQUUsS0FBSzt3QkFDakIsV0FBVyxFQUFFLGdCQUFnQjt3QkFDN0IsV0FBVyxFQUFFLFNBQVM7d0JBQ3RCLElBQUksRUFBRSxhQUFhO3FCQUN0QjtvQkFDRDt3QkFDSSxtQkFBbUIsRUFBRSxnQkFBZ0I7d0JBQ3JDLE9BQU8sRUFBRSxDQUFDO3dCQUNWLFVBQVUsRUFBRSxLQUFLO3dCQUNqQixXQUFXLEVBQUUsZ0JBQWdCO3dCQUM3QixXQUFXLEVBQUUsU0FBUzt3QkFDdEIsSUFBSSxFQUFFLGFBQWE7cUJBQ3RCO2lCQUNKLENBQUM7Z0JBRUYsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQztnQkFFekgsT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDN0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsZ0JBQWdCLEVBQUUsMkRBQTJELENBQUMsQ0FBQztnQkFDbEgsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzFCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLG1CQUFtQixFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFOUksT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDN0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLDJEQUEyRCxDQUFDLENBQUM7Z0JBQ3BHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7WUFFSCxFQUFFLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxFQUFFO2dCQUN2QixLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxxQkFBcUIsRUFBRSxXQUFXLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFFcEssT0FBTyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRTtvQkFDN0QsTUFBTSxDQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsRUFBRSxFQUFFLDJEQUEyRCxDQUFDLENBQUM7Z0JBQ3BHLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7WUFDbkMsTUFBTSxNQUFNLEdBQVcsc0NBQXNDLENBQUM7WUFDOUQsTUFBTSxTQUFTLEdBQVcsZUFBZSxDQUFDO1lBRTFDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEQsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztZQUUzQyxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQzVGLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLDRCQUE0QixFQUFFLEdBQUcsRUFBRTtZQUNsQyxNQUFNLFVBQVUsR0FBVyxPQUFPLENBQUM7WUFDbkMsTUFBTSxTQUFTLEdBQVcsT0FBTyxDQUFDO1lBRWxDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFFbEQsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUVwRCxNQUFNLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLENBQUMsV0FBVyxDQUFDLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ3BHLE1BQU0sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLENBQUMsT0FBTyxFQUFFLHFCQUFxQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDbEcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQyxDQUFDO1FBRUgsRUFBRSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtZQUM3QixNQUFNLFFBQVEsR0FBVyxzQ0FBc0MsQ0FBQztZQUNoRSxNQUFNLFdBQVcsR0FBVyxlQUFlLENBQUMsQ0FBQywyQ0FBMkM7WUFFeEYsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztZQUVuRixPQUFPLGdCQUFnQixDQUFDLFlBQVksRUFBRSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLDJCQUEyQixDQUFDLENBQUM7WUFDL0QsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==