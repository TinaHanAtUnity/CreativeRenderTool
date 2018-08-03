System.register(["tslib", "mocha", "chai", "sinon", "Utilities/Request", "Managers/ThirdPartyEventManager", "Native/Api/Storage", "Native/Api/Request", "Native/NativeBridge", "Managers/WakeUpManager", "Managers/FocusManager", "Managers/OperativeEventManager", "Test/Unit/TestHelpers/TestFixtures", "Constants/Platform", "Managers/SessionManager", "Managers/MetaDataManager", "Native/Api/DeviceInfo", "Managers/OperativeEventManagerFactory", "Utilities/HttpKafka"], function (exports_1, context_1) {
    "use strict";
    var tslib_1, chai_1, sinon, Request_1, ThirdPartyEventManager_1, Storage_1, Request_2, NativeBridge_1, WakeUpManager_1, FocusManager_1, OperativeEventManager_1, TestFixtures_1, Platform_1, SessionManager_1, MetaDataManager_1, DeviceInfo_1, OperativeEventManagerFactory_1, HttpKafka_1, TestStorageApi, TestRequestApi;
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
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
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
            function (DeviceInfo_1_1) {
                DeviceInfo_1 = DeviceInfo_1_1;
            },
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
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
            describe('OperativeEventManagerTest', function () {
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
                var operativeEventManagerParams;
                var campaign = TestFixtures_1.TestFixtures.getCampaign();
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
                    operativeEventManagerParams = {
                        nativeBridge: nativeBridge,
                        request: request,
                        metaDataManager: metaDataManager,
                        sessionManager: sessionManager,
                        clientInfo: clientInfo,
                        deviceInfo: deviceInfo,
                        configuration: TestFixtures_1.TestFixtures.getConfiguration(),
                        campaign: campaign
                    };
                    operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(operativeEventManagerParams);
                });
                it('Send successful operative event', function () {
                    var eventId = '1234';
                    var sessionId = '5678';
                    var url = 'https://www.example.net/operative_event';
                    var data = 'Test data';
                    var requestSpy = sinon.spy(request, 'post');
                    return operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
                        chai_1.assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');
                        var urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
                        var dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
                        return storageApi.get(Storage_1.StorageType.PRIVATE, urlKey).catch(function (error) {
                            var errorCode = error.shift();
                            chai_1.assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event url should be deleted');
                        }).then(function () {
                            return storageApi.get(Storage_1.StorageType.PRIVATE, dataKey);
                        }).catch(function (error) {
                            var errorCode = error.shift();
                            chai_1.assert.equal('COULDNT_GET_VALUE', errorCode, 'Successful operative event data should be deleted');
                        }).then(function () {
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after successful operative event');
                        });
                    });
                });
                it('Send failed operative event', function () {
                    var clock = sinon.useFakeTimers();
                    var eventId = '1234';
                    var sessionId = '5678';
                    var url = 'https://www.example.net/fail';
                    var data = 'Test data';
                    var requestSpy = sinon.spy(request, 'post');
                    var event = operativeEventManager.sendEvent('test', eventId, sessionId, url, data).then(function () {
                        chai_1.assert.fail('Send failed operative event failed to fail');
                    }).catch(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Failed operative event did not try sending POST request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Operative event url does not match');
                        chai_1.assert.equal(data, requestSpy.getCall(0).args[1], 'Operative event data does not match');
                        var urlKey = 'session.' + sessionId + '.operative.' + eventId + '.url';
                        var dataKey = 'session.' + sessionId + '.operative.' + eventId + '.data';
                        return storageApi.get(Storage_1.StorageType.PRIVATE, urlKey).then(function (storedUrl) {
                            chai_1.assert.equal(url, storedUrl, 'Failed operative event url was not correctly stored');
                        }).then(function () {
                            return storageApi.get(Storage_1.StorageType.PRIVATE, dataKey);
                        }).then(function (storedData) {
                            chai_1.assert.equal(data, storedData, 'Failed operative event data was not correctly stored');
                            chai_1.assert.equal(false, storageApi.isDirty(), 'Storage should not be left dirty after failed operative event');
                        });
                    });
                    clock.tick(30000);
                    clock.restore();
                    return event;
                });
                it('Send click attribution event', function () {
                    var url = 'https://www.example.net/third_party_event';
                    var requestSpy = sinon.spy(request, 'get');
                    return thirdPartyEventManager.clickAttributionEvent(url, false).then(function () {
                        chai_1.assert(requestSpy.calledOnce, 'Click attribution event did not try sending GET request');
                        chai_1.assert.equal(url, requestSpy.getCall(0).args[0], 'Click attribution event url does not match');
                    });
                });
                describe('sending clicks', function () {
                    var placement;
                    var session;
                    var requestSpy;
                    var uniqueEventID = '42';
                    var gamerSid = 'foobar';
                    var previousPlacementId = 'foobar1';
                    beforeEach(function () {
                        placement = TestFixtures_1.TestFixtures.getPlacement();
                        session = TestFixtures_1.TestFixtures.getSession();
                        campaign = TestFixtures_1.TestFixtures.getCampaign();
                        nativeBridge.DeviceInfo = sinon.createStubInstance(DeviceInfo_1.DeviceInfoApi);
                        requestSpy = sinon.spy(request, 'post');
                        operativeEventManager.setGamerServerId('foobar');
                        OperativeEventManager_1.OperativeEventManager.setPreviousPlacementId(previousPlacementId);
                        nativeBridge.DeviceInfo.getUniqueEventId.returns(Promise.resolve('42'));
                        nativeBridge.DeviceInfo.getNetworkType.returns(Promise.resolve(13));
                        nativeBridge.DeviceInfo.getConnectionType.returns(Promise.resolve('wifi'));
                        nativeBridge.DeviceInfo.getScreenWidth.returns(Promise.resolve(1280));
                        nativeBridge.DeviceInfo.getScreenHeight.returns(Promise.resolve(768));
                    });
                    describe('should send the proper data', function () {
                        it('common data', function () {
                            return operativeEventManager.sendClick({ placement: placement }).then(function () {
                                chai_1.assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                                var data = JSON.parse(requestSpy.getCall(0).args[1]);
                                chai_1.assert.equal(data.auctionId, session.getId());
                                chai_1.assert.equal(data.gameSessionId, sessionManager.getGameSessionId());
                                chai_1.assert.equal(data.campaignId, campaign.getId());
                                chai_1.assert.equal(data.adType, campaign.getAdType());
                                chai_1.assert.equal(data.correlationId, campaign.getCorrelationId());
                                chai_1.assert.equal(data.creativeId, campaign.getCreativeId());
                                chai_1.assert.equal(data.seatId, campaign.getSeatId());
                                chai_1.assert.equal(data.placementId, placement.getId());
                                chai_1.assert.equal(data.apiLevel, deviceInfo.getApiLevel());
                                chai_1.assert.equal(data.advertisingTrackingId, deviceInfo.getAdvertisingIdentifier());
                                chai_1.assert.equal(data.limitAdTracking, deviceInfo.getLimitAdTracking());
                                chai_1.assert.equal(data.osVersion, deviceInfo.getOsVersion());
                                chai_1.assert.equal(data.sid, gamerSid);
                                chai_1.assert.equal(data.deviceMake, deviceInfo.getManufacturer());
                                chai_1.assert.equal(data.deviceModel, deviceInfo.getModel());
                                chai_1.assert.equal(data.sdkVersion, clientInfo.getSdkVersion());
                                chai_1.assert.equal(data.previousPlacementId, previousPlacementId);
                                chai_1.assert.equal(data.bundleId, clientInfo.getApplicationName());
                                chai_1.assert.equal(data.meta, campaign.getMeta());
                                chai_1.assert.equal(data.screenDensity, deviceInfo.getScreenDensity());
                                chai_1.assert.equal(data.screenSize, deviceInfo.getScreenLayout());
                                chai_1.assert.equal(data.platform, Platform_1.Platform[clientInfo.getPlatform()].toLowerCase());
                                chai_1.assert.equal(data.language, deviceInfo.getLanguage());
                            });
                        });
                        it('PerformanceCampaign specific', function () {
                            return operativeEventManager.sendClick({ placement: placement }).then(function () {
                                chai_1.assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                                var data = JSON.parse(requestSpy.getCall(0).args[1]);
                                var url = requestSpy.getCall(0).args[0];
                                chai_1.assert.equal(url, campaign.getClickUrl() + '&redirect=false', 'URL not what was expected');
                                chai_1.assert.isDefined(data.cached, 'cached -value should be defined');
                                chai_1.assert.isFalse(data.cached, 'cached -value should be false');
                            });
                        });
                        it('XPromoCampaign specific', function () {
                            HttpKafka_1.HttpKafka.setRequest(request);
                            campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                            var params = tslib_1.__assign({}, operativeEventManagerParams, { campaign: campaign });
                            var xPromoOperativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(params);
                            HttpKafka_1.HttpKafka.setRequest(request);
                            return xPromoOperativeEventManager.sendClick({ placement: placement, videoOrientation: 'landscape' }).then(function () {
                                chai_1.assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                                var url = requestSpy.getCall(0).args[0];
                                chai_1.assert.equal(url, 'https://httpkafka.unityads.unity3d.com/v1/events', 'URL not what was expected');
                            });
                        });
                        it('VastCampaign specific', function () {
                            campaign = TestFixtures_1.TestFixtures.getEventVastCampaign();
                            var params = tslib_1.__assign({}, operativeEventManagerParams, { campaign: campaign });
                            operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(params);
                            return operativeEventManager.sendClick({ placement: placement }).then(function () {
                                chai_1.assert(requestSpy.notCalled, 'Operative event did send POST request');
                            });
                        });
                        it('MRAIDCampaign specific', function () {
                            campaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                            var params = tslib_1.__assign({}, operativeEventManagerParams, { campaign: campaign });
                            operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(params);
                            return operativeEventManager.sendClick({ placement: placement }).then(function () {
                                chai_1.assert(requestSpy.calledOnce, 'Operative event did not send POST request');
                                var data = JSON.parse(requestSpy.getCall(0).args[1]);
                                var url = requestSpy.getCall(0).args[0];
                                chai_1.assert.equal(url, campaign.getClickUrl() + '&redirect=false', 'URL not what was expected');
                                chai_1.assert.isDefined(data.cached, 'cached -value should be defined');
                                chai_1.assert.isFalse(data.cached, 'cached -value should be false');
                            });
                        });
                        it('DisplayInterstitialCampaign specific', function () {
                            campaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                            var params = tslib_1.__assign({}, operativeEventManagerParams, { campaign: campaign });
                            operativeEventManager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager(params);
                            return operativeEventManager.sendClick({ placement: placement }).then(function () {
                                chai_1.assert(requestSpy.notCalled, 'Operative event did send POST request');
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk9wZXJhdGl2ZUV2ZW50TWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQTRCQTtnQkFBNkIsMENBQVU7Z0JBQXZDO29CQUFBLHFFQTZHQztvQkEzR1csY0FBUSxHQUFHLEVBQUUsQ0FBQztvQkFDZCxZQUFNLEdBQVksS0FBSyxDQUFDOztnQkEwR3BDLENBQUM7Z0JBeEdVLDRCQUFHLEdBQVYsVUFBYyxXQUF3QixFQUFFLEdBQVcsRUFBRSxLQUFRO29CQUN6RCxJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztvQkFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ2pFLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDcEMsQ0FBQztnQkFFTSw0QkFBRyxHQUFWLFVBQWMsV0FBd0IsRUFBRSxHQUFXO29CQUMvQyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDM0QsSUFBRyxDQUFDLFFBQVEsRUFBRTt3QkFDVixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO3FCQUNyRDtvQkFDRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ3JDLENBQUM7Z0JBRU0sZ0NBQU8sR0FBZCxVQUFlLFdBQXdCLEVBQUUsR0FBVyxFQUFFLFNBQWtCO29CQUNwRSxPQUFPLE9BQU8s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