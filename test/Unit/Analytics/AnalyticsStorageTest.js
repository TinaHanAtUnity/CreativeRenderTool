System.register(["mocha", "sinon", "chai", "../TestHelpers/TestFixtures", "Analytics/AnalyticsStorage", "Native/Api/Storage"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, TestFixtures_1, AnalyticsStorage_1, Storage_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (AnalyticsStorage_1_1) {
                AnalyticsStorage_1 = AnalyticsStorage_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            }
        ],
        execute: function () {
            describe('AnalyticsStorageTest', function () {
                var nativeBridge;
                var analyticsStorage;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    analyticsStorage = new AnalyticsStorage_1.AnalyticsStorage(nativeBridge);
                });
                describe('should get analytics user id', function () {
                    it('with empty storage', function () {
                        var nativeId = '6C7FA2C0-4333-47BE-8DE2-2F24E33E710C';
                        var finalId = '6c7fa2c0433347be8de22f24e33e710c';
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_VALUE', 'analytics.userid']));
                        return analyticsStorage.getUserId().then(function (id) {
                            chai_1.assert.equal(id, finalId, 'created analytics user id does not match');
                        });
                    });
                    it('with no storage', function () {
                        var nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                        var finalId = '6c7fa2c0433347be8de22f24e33e710c';
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.userid').returns(Promise.reject(['COULDNT_GET_STORAGE', Storage_1.StorageType.PRIVATE, 'analytics.userid']));
                        return analyticsStorage.getUserId().then(function (id) {
                            chai_1.assert.equal(id, finalId, 'created analytics user id does not match');
                        });
                    });
                    it('with existing id in storage', function () {
                        var storedId = '9b67056f1aa44680be30df179f244211';
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.userid').returns(Promise.resolve(storedId));
                        return analyticsStorage.getUserId().then(function (id) {
                            chai_1.assert.equal(id, storedId, 'stored analytics id does not match');
                        });
                    });
                });
                describe('should get analytics session id', function () {
                    it('with reinit true', function () {
                        var storedId = 170866775104164;
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.sessionid').returns(Promise.resolve(storedId));
                        return analyticsStorage.getSessionId(true).then(function (id) {
                            chai_1.assert.equal(id, storedId, 'stored session id does not match');
                        });
                    });
                    it('with reinit false', function () {
                        var nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                        var analyticsId = 119295447155507; // first 12 hex digits converted to decimal
                        sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.sessionid').callsFake(function () { return Promise.reject(['COULDNT_GET_VALUE', 'analytics.sessionid']); });
                        return analyticsStorage.getSessionId(false).then(function (id) {
                            chai_1.assert.equal(id, analyticsId, 'created session id does not match');
                        });
                    });
                });
                it('should get app version', function () {
                    var appVersion = '1.2.3';
                    sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.appversion').returns(Promise.resolve(appVersion));
                    return analyticsStorage.getAppVersion().then(function (version) {
                        chai_1.assert.equal(version, appVersion, 'stored app version does not match');
                    });
                });
                it('should get OS version', function () {
                    var osVersion = '9.8.7';
                    sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PRIVATE, 'analytics.osversion').returns(Promise.resolve(osVersion));
                    return analyticsStorage.getOsVersion().then(function (version) {
                        chai_1.assert.equal(version, osVersion, 'stored OS version does not match');
                    });
                });
                describe('should get IAP transactions', function () {
                    it('with one transaction in storage', function () {
                        var transaction = {
                            receiptPurchaseData: 'test_purchase_data',
                            'price': 1,
                            'currency': 'USD',
                            'signature': 'test_signature',
                            'productId': 'test_id',
                            'ts': 1493905891004
                        };
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve([transaction]));
                        return analyticsStorage.getIAPTransactions().then(function (transactions) {
                            chai_1.assert.deepEqual(transactions[0], transaction, 'transaction data does not match');
                        });
                    });
                    it('with three transactions in storage', function () {
                        var testTransactions = [
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
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, 'iap.purchases').returns(Promise.resolve(testTransactions));
                        return analyticsStorage.getIAPTransactions().then(function (transactions) {
                            chai_1.assert.deepEqual(transactions, testTransactions, 'transaction data from three test purchases does not match');
                        });
                    });
                    it('with empty storage', function () {
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_VALUE', 'iap.purchases']));
                        return analyticsStorage.getIAPTransactions().then(function (transactions) {
                            chai_1.assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
                        });
                    });
                    it('with no storage', function () {
                        sinon.stub(nativeBridge.Storage, 'get').withArgs(Storage_1.StorageType.PUBLIC, 'iap.purchases').returns(Promise.reject(['COULDNT_GET_STORAGE', Storage_1.StorageType.PUBLIC, 'iap.purchases']));
                        return analyticsStorage.getIAPTransactions().then(function (transactions) {
                            chai_1.assert.deepEqual(transactions, [], 'transaction data from empty storage is not an empty array');
                        });
                    });
                });
                it('should write ids to storage', function () {
                    var userId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                    var sessionId = 119295447155507;
                    var setSpy = sinon.spy(nativeBridge.Storage, 'set');
                    var writeSpy = sinon.spy(nativeBridge.Storage, 'write');
                    analyticsStorage.setIds(userId, sessionId);
                    chai_1.assert.deepEqual(setSpy.getCall(0).args, [Storage_1.StorageType.PRIVATE, 'analytics.userid', userId]);
                    chai_1.assert.deepEqual(setSpy.getCall(1).args, [Storage_1.StorageType.PRIVATE, 'analytics.sessionid', sessionId]);
                    chai_1.assert.deepEqual(writeSpy.getCall(0).args, [Storage_1.StorageType.PRIVATE]);
                });
                it('should versions to storage', function () {
                    var appVersion = '1.2.3';
                    var osVersion = '9.8.7';
                    var setSpy = sinon.spy(nativeBridge.Storage, 'set');
                    var writeSpy = sinon.spy(nativeBridge.Storage, 'write');
                    analyticsStorage.setVersions(appVersion, osVersion);
                    chai_1.assert.deepEqual(setSpy.getCall(0).args, [Storage_1.StorageType.PRIVATE, 'analytics.appversion', appVersion]);
                    chai_1.assert.deepEqual(setSpy.getCall(1).args, [Storage_1.StorageType.PRIVATE, 'analytics.osversion', osVersion]);
                    chai_1.assert.deepEqual(writeSpy.getCall(0).args, [Storage_1.StorageType.PRIVATE]);
                });
                it('should get integer id', function () {
                    var nativeId = '6c7fa2c0-4333-47be-8de2-2f24e33e710c';
                    var analyticsId = 119295447155507; // first 12 hex digits converted to decimal
                    sinon.stub(nativeBridge.DeviceInfo, 'getUniqueEventId').returns(Promise.resolve(nativeId));
                    return analyticsStorage.getIntegerId().then(function (id) {
                        chai_1.assert.equal(id, analyticsId, 'integer id does not match');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQW5hbHl0aWNzU3RvcmFnZVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBbmFseXRpY3NTdG9yYWdlVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBU0EsUUFBUSxDQUFDLHNCQUFzQixFQUFFO2dCQUM3QixJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksZ0JBQWtDLENBQUM7Z0JBRXZDLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDOUMsZ0JBQWdCLEdBQUcsSUFBSSxtQ0FBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDMUQsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLDhCQUE4QixFQUFFO29CQUNyQyxFQUFFLENBQUMsb0JBQW9CLEVBQUU7d0JBQ3JCLElBQU0sUUFBUSxHQUFXLHNDQUFzQyxDQUFDO3dCQUNoRSxJQUFNLE9BQU8sR0FBVyxrQ0FBa0MsQ0FBQzt3QkFFM0QsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsVUFBVSxFQUFFLGtCQUFrQixDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDM0YsS0FBSyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQyxxQkFBVyxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBRTdKLE9BQU8sZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLFVBQUEsRUFBRTs0QkFDdkMsYUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLDBDQUEwQyxDQUFDLENBQUM7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