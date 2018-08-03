System.register(["tslib", "mocha", "chai", "sinon", "Utilities/Request", "Managers/ThirdPartyEventManager", "Native/Api/Storage", "Native/Api/Request", "Native/NativeBridge", "Managers/WakeUpManager", "Managers/FocusManager", "Test/Unit/TestHelpers/TestFixtures", "Constants/Platform", "Managers/SessionManager", "Managers/MetaDataManager", "Managers/OperativeEventManagerFactory"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, Request_1, ThirdPartyEventManager_1, Storage_1, Request_2, NativeBridge_1, WakeUpManager_1, FocusManager_1, TestFixtures_1, Platform_1, SessionManager_1, MetaDataManager_1, OperativeEventManagerFactory_1, TestStorageApi, TestRequestApi;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (tslib_1_1) {
                tslib_1 = tslib_1_1;
            },
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (ThirdPartyEventManager_1_1) {
                ThirdPartyEventManager_1 = ThirdPartyEventManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Request_2_1) {
                Request_2 = Request_2_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            }
        ],
        execute: function () {
            TestStorageApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestStorageApi, _super);
                function TestStorageApi() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._storage = {};
                    _this._dirty = false;
                    return _this;
                }
                TestStorageApi.prototype.set = function (storageType, key, value) {
                    this._dirty = true;
                    this._storage = this.setInMemoryValue(this._storage, key, value);
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.get = function (storageType, key) {
                    var retValue = this.getInMemoryValue(this._storage, key);
                    if (!retValue) {
                        return Promise.reject(['COULDNT_GET_VALUE', key]);
                    }
                    return Promise.resolve(retValue);
                };
                TestStorageApi.prototype.getKeys = function (storageType, key, recursive) {
                    return Promise.resolve(this.getInMemoryKeys(this._storage, key));
                };
                TestStorageApi.prototype.write = function (storageType) {
                    this._dirty = false;
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.delete = function (storageType, key) {
                    this._dirty = true;
                    this._storage = this.deleteInMemoryValue(this._storage, key);
                    return Promise.resolve(void (0));
                };
                TestStorageApi.prototype.isDirty = function () {
                    return this._dirty;
                };
                TestStorageApi.prototype.setInMemoryValue = function (storage, key, value) {
                    var keyArray = key.split('.');
                    if (keyArray.length > 1) {
                        if (!storage[keyArray[0]]) {
                            storage[keyArray[0]] = {};
                        }
                        storage[keyArray[0]] = this.setInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'), value);
                        return storage;
                    }
                    else {
                        storage[keyArray[0]] = value;
                        return storage;
                    }
                };
                TestStorageApi.prototype.getInMemoryValue = function (storage, key) {
                    var keyArray = key.split('.');
                    if (keyArray.length > 1) {
                        if (!storage[keyArray[0]]) {
                            return null;
                        }
                        return this.getInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
                    }
                    else {
                        return storage[key];
                    }
                };
                TestStorageApi.prototype.getInMemoryKeys = function (storage, key) {
                    var keyArray = key.split('.');
                    if (keyArray.length > 1) {
                        if (!storage[keyArray[0]]) {
                            return [];
                        }
                        return this.getInMemoryKeys(storage[keyArray[0]], keyArray.slice(1).join('.'));
                    }
                    else {
                        if (!storage[key]) {
                            return [];
                        }
                        var retArray = [];
                        for (var property in storage[key]) {
                            if (storage.hasOwnProperty(key)) {
                                retArray.push(property);
                            }
                        }
                        return retArray;
                    }
                };
                TestStorageApi.prototype.deleteInMemoryValue = function (storage, key) {
                    var keyArray = key.split('.');
                    if (keyArray.length > 1) {
                        if (!storage[keyArray[0]]) {
                            storage[keyArray[0]] = {};
                        }
                        storage[keyArray[0]] = this.deleteInMemoryValue(storage[keyArray[0]], keyArray.slice(1).join('.'));
                        return storage;
                    }
                    else {
                        delete storage[keyArray[0]];
                        return storage;
                    }
                };
                return TestStorageApi;
            }(Storage_1.StorageApi));
            TestRequestApi = /** @class */ (function (_super) {
                tslib_1.__extends(TestRequestApi, _super);
                function TestRequestApi() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                TestRequestApi.prototype.get = function (id, url, headers) {
                    var _this = this;
                    if (url.indexOf('/fail') !== -1) {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
                        }, 0);
                    }
                    else {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
                        }, 0);
                    }
                    return Promise.resolve(id);
                };
                TestRequestApi.prototype.post = function (id, url, body, headers) {
                    var _this = this;
                    if (url.indexOf('/fail') !== -1) {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'FAILED', id, url, 'Fail response']);
                        }, 0);
                    }
                    else {
                        setTimeout(function () {
                            _this._nativeBridge.handleEvent(['REQUEST', 'COMPLETE', id, url, 'Success response', 200, headers]);
                        }, 0);
                    }
                    return Promise.resolve(id);
                };
                return TestRequestApi;
            }(Request_2.RequestApi));
            describe('SessionManagerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var storageApi;
                var requestApi;
                var focusManager;
                var operativeEventManager;
                var deviceInfo;
                var clientInfo;
                var thirdPartyEventManager;
                var request;
                var metaDataManager;
                var sessionManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    storageApi = nativeBridge.Storage = new TestStorageApi(nativeBridge);
                    requestApi = nativeBridge.Request = new TestRequestApi(nativeBridge);
                    request = new Request_1.Request(nativeBridge, new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager));
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    var wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    thirdPartyEventManager = new ThirdPartyEventManager_1.ThirdPartyEventManager(nativeBridge, request);
                    sessionManager = new SessionManager_1.SessionManager(nativeBridge, request);
                    operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                        campaign: TestFixtures_1.TestFixtures.getCampaign()
                    });
                });
                xit('Retry failed event', function () {
                    var url = 'https://www.example.net/retry_event';
                    var data = 'Retry test';
                    var sessionId = 'abcd-1234';
                    var eventId = '5678-efgh';
                    var sessionTsKey = 'session.' + sessionId + '.ts';
                    var urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
                    var dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
                    storageApi.set(Storage_1.StorageType.PRIVATE, sessionTsKey, Date.now() - 100);
                    storageApi.set(Storage_1.StorageType.PRIVATE, urlKey, url);
                    storageApi.set(Storage_1.StorageType.PRIVATE, dataKey, data);
                    var requestSpy = sinon.spy(request, 'post');
                    return sessionManager.sendUnsentSessions().then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Retry failed event did not send POST request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Retry failed event url does not match');
                        chai_1.assert.equal(data, requestSpy.getCall(0).args[1], 'Retry failed event data does not match');
                        return storageApi.get(Storage_1.StorageType.PRIVATE, urlKey).then(function () {
                            chai_1.assert.fail('Retried event url should be deleted from storage');
                        }).catch(function (error) {
                            chai_1.assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event url should be deleted from storage');
                        }).then(function () {
                            return storageApi.get(Storage_1.StorageType.PRIVATE, dataKey);
                        }).then(function () {
                            chai_1.assert.fail('Retried event data should be deleted from storage');
                        }).catch(function (error) {
                            chai_1.assert.equal('COULDNT_GET_VALUE', error[0], 'Retried event data should be deleted from storage');
                        }).then(function () {
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after retry failed event');
                        });
                    });
                });
                it('Start new session', function () {
                    var sessionId = 'new-12345';
                    var sessionTsKey = 'session.' + sessionId + '.ts';
                    return sessionManager.startNewSession(sessionId).then(function () {
                        return storageApi.get(Storage_1.StorageType.PRIVATE, sessionTsKey).then(function (timestamp) {
                            chai_1.assert.equal(true, Date.now() >= timestamp, 'New session timestamp must be in present or past');
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after starting new session');
                        });
                    });
                });
                it('Delete old session', function () {
                    var sessionId = 'old-1234';
                    var sessionTsKey = 'session.' + sessionId + '.ts';
                    var threeMonthsAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
                    storageApi.set(Storage_1.StorageType.PRIVATE, sessionTsKey, threeMonthsAgo);
                    return sessionManager.sendUnsentSessions().then(function () {
                        return storageApi.get(Storage_1.StorageType.PRIVATE, sessionTsKey).then(function () {
                            chai_1.assert.fail('Old session found in storage but it should have been deleted');
                        }).catch(function (error) {
                            chai_1.assert.equal('COULDNT_GET_VALUE', error[0], 'Old session should have been deleted');
                        }).then(function () {
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after deleting old session');
                        });
                    });
                });
                it('Delete session without timestamp', function () {
                    var randomKey = 'session.random123.operative.456.test';
                    storageApi.set(Storage_1.StorageType.PRIVATE, randomKey, 'test');
                    return sessionManager.sendUnsentSessions().then(function () {
                        return storageApi.get(Storage_1.StorageType.PRIVATE, randomKey).then(function () {
                            chai_1.assert.fail('Session without timestamp found in storage but it should have been deleted');
                        }).catch(function (error) {
                            chai_1.assert.equal('COULDNT_GET_VALUE', error[0], 'Session without timestamp should have been deleted');
                        }).then(function () {
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after deleting session without timestamp');
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvbk1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiU2Vzc2lvbk1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFvQkE7Z0JBQTZCLDBDQUFVO2dCQUF2QztvQkFBQSxxRUE2R0M7b0JBM0dXLGNBQVEsR0FBRyxFQUFFLENBQUM7b0JBQ2QsWUFBTSxHQUFZLEtBQUssQ0FBQzs7Z0JBMEdwQyxDQUFDO2dCQXhHVSw0QkFBRyxHQUFWLFVBQWMsV0FBd0IsRUFBRSxHQUFXLEVBQUUsS0FBUTtvQkFDekQsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7b0JBQ25CLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNqRSxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLENBQUM7Z0JBRU0sNEJBQUcsR0FBVixVQUFjLFdBQXdCLEVBQUUsR0FBVztvQkFDL0MsSUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7b0JBQzNELElBQUcsQ0FBQyxRQUFRLEVBQUU7d0JBQ1YsT0FBTyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsbUJBQW1CLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztxQkFDckQ7b0JBQ0QsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUNyQyxDQUFDO2dCQUVNLGdDQUFPLEdBQWQsVUFBZSxXQUF3QixFQUFFLEdBQVcsRUFBRSxTQUFrQjtvQkFDcEUsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FB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