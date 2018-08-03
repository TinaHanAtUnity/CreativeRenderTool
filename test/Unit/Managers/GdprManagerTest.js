System.register(["mocha", "chai", "sinon", "Models/Configuration", "Native/NativeBridge", "Models/ClientInfo", "Managers/GdprManager", "Native/Api/Storage", "Utilities/Request", "Utilities/Diagnostics", "Utilities/Observable", "Native/Api/Sdk", "Models/AndroidDeviceInfo", "Utilities/HttpKafka", "Constants/Platform"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, Configuration_1, NativeBridge_1, ClientInfo_1, GdprManager_1, Storage_1, Request_1, Diagnostics_1, Observable_1, Sdk_1, AndroidDeviceInfo_1, HttpKafka_1, Platform_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (sinon_1) {
                sinon = sinon_1;
            },
            function (Configuration_1_1) {
                Configuration_1 = Configuration_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            },
            function (AndroidDeviceInfo_1_1) {
                AndroidDeviceInfo_1 = AndroidDeviceInfo_1_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            }
        ],
        execute: function () {
            describe('GdprManagerTest', function () {
                var testGameId = '12345';
                var testAdvertisingId = '128970986778678';
                var testUnityProjectId = 'game-1';
                var nativeBridge;
                var deviceInfo;
                var clientInfo;
                var configuration;
                var gdprManager;
                var request;
                var onSetStub;
                var getStub;
                var setStub;
                var writeStub;
                var sendGDPREventStub;
                var httpKafkaStub;
                var consentlastsent = false;
                var consent = false;
                var isGDPREnabled = false;
                var storageTrigger;
                beforeEach(function () {
                    consentlastsent = false;
                    consent = false;
                    nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                    nativeBridge.Sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                    nativeBridge.Storage = sinon.createStubInstance(Storage_1.StorageApi);
                    nativeBridge.Storage.onSet = new Observable_1.Observable2();
                    clientInfo = sinon.createStubInstance(ClientInfo_1.ClientInfo);
                    deviceInfo = sinon.createStubInstance(AndroidDeviceInfo_1.AndroidDeviceInfo);
                    configuration = sinon.createStubInstance(Configuration_1.Configuration);
                    request = sinon.createStubInstance(Request_1.Request);
                    onSetStub = sinon.stub(nativeBridge.Storage.onSet, 'subscribe');
                    getStub = nativeBridge.Storage.get;
                    setStub = nativeBridge.Storage.set.resolves();
                    writeStub = nativeBridge.Storage.write.resolves();
                    clientInfo.getPlatform.returns(Platform_1.Platform.TEST);
                    clientInfo.getGameId.returns(testGameId);
                    deviceInfo.getAdvertisingIdentifier.returns(testAdvertisingId);
                    configuration.getUnityProjectId.returns(testUnityProjectId);
                    configuration.isGDPREnabled.callsFake(function () {
                        return isGDPREnabled;
                    });
                    httpKafkaStub = sinon.stub(HttpKafka_1.HttpKafka, 'sendEvent').resolves();
                    getStub.withArgs(Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent').callsFake(function () {
                        return Promise.resolve(consentlastsent);
                    });
                    getStub.withArgs(Storage_1.StorageType.PUBLIC, 'gdpr.consent.value').callsFake(function () {
                        return Promise.resolve(consent);
                    });
                    onSetStub.callsFake(function (fun) {
                        storageTrigger = fun;
                    });
                    gdprManager = new GdprManager_1.GdprManager(nativeBridge, deviceInfo, clientInfo, configuration, request);
                    sendGDPREventStub = sinon.spy(gdprManager, 'sendGDPREvent');
                });
                afterEach(function () {
                    httpKafkaStub.restore();
                    isGDPREnabled = false;
                });
                it('should subscribe to Storage.onSet', function () {
                    sinon.assert.calledOnce(onSetStub);
                });
                describe('when storage is set', function () {
                    describe('and the consent value has changed', function () {
                        var tests = [{
                                lastConsent: false,
                                storedConsent: true,
                                event: 'consent',
                                optOutEnabled: false,
                                optOutRecorded: true,
                                isGdprEnabled: true
                            }, {
                                lastConsent: true,
                                storedConsent: false,
                                event: 'optout',
                                optOutEnabled: true,
                                optOutRecorded: true,
                                isGdprEnabled: true
                            }];
                        tests.forEach(function (t) {
                            it("subscribe should send \"" + t.event + "\" when \"" + t.storedConsent + "\"", function () {
                                isGDPREnabled = t.isGdprEnabled;
                                consentlastsent = t.lastConsent;
                                var writePromise = new Promise(function (resolve) {
                                    writeStub.reset();
                                    writeStub.callsFake(function () {
                                        return Promise.resolve().then(resolve);
                                    });
                                });
                                storageTrigger('', { gdpr: { consent: { value: t.storedConsent } } });
                                return writePromise.then(function () {
                                    sinon.assert.calledOnce(onSetStub);
                                    sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent');
                                    if (t.event === 'optout') {
                                        sinon.assert.calledWithExactly(sendGDPREventStub, t.event, GdprManager_1.GDPREventSource.METADATA);
                                    }
                                    else {
                                        sinon.assert.calledWithExactly(sendGDPREventStub, t.event);
                                    }
                                    sinon.assert.calledWith(setStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                                    sinon.assert.calledWith(writeStub, Storage_1.StorageType.PRIVATE);
                                    sinon.assert.calledWith(configuration.setOptOutEnabled, t.optOutEnabled);
                                    sinon.assert.calledWith(configuration.setOptOutRecorded, t.optOutRecorded);
                                });
                            });
                        });
                    });
                    describe('and configuration isGDPREnabled is false', function () {
                        it('should not do anything', function () {
                            isGDPREnabled = false;
                            consentlastsent = false;
                            storageTrigger('', { gdpr: { consent: { value: true } } });
                            sinon.assert.calledOnce(onSetStub);
                            sinon.assert.notCalled(getStub);
                            sinon.assert.notCalled(sendGDPREventStub);
                            sinon.assert.notCalled(setStub);
                            sinon.assert.notCalled(writeStub);
                            sinon.assert.notCalled(configuration.setOptOutEnabled);
                            sinon.assert.notCalled(configuration.setOptOutRecorded);
                        });
                    });
                    describe('and the stored consent is undefined', function () {
                        it('should not do anything', function () {
                            storageTrigger('', {});
                            sinon.assert.calledOnce(onSetStub);
                            sinon.assert.notCalled(getStub);
                            sinon.assert.notCalled(sendGDPREventStub);
                            sinon.assert.notCalled(setStub);
                            sinon.assert.notCalled(writeStub);
                            sinon.assert.notCalled(configuration.setGDPREnabled);
                            sinon.assert.notCalled(configuration.setOptOutEnabled);
                            sinon.assert.notCalled(configuration.setOptOutRecorded);
                        });
                    });
                    describe('and the stored consent has not changed', function () {
                        [true, false].forEach(function (b) {
                            it("should not send anything for value \"" + b + "\"", function () {
                                isGDPREnabled = true;
                                consentlastsent = b;
                                storageTrigger('', { gdpr: { consent: { value: b } } });
                                return Promise.resolve().then(function () {
                                    sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent');
                                    return getStub.firstCall.returnValue.then(function () {
                                        sinon.assert.notCalled(sendGDPREventStub);
                                        sinon.assert.calledWith(configuration.setOptOutEnabled, !b);
                                        sinon.assert.calledWith(configuration.setOptOutRecorded, true);
                                    });
                                });
                            });
                        });
                    });
                });
                describe('getConsentAndUpdateConfiguration', function () {
                    describe('and consent is undefined', function () {
                        it('should not update the configuration', function () {
                            consent = undefined;
                            return gdprManager.getConsentAndUpdateConfiguration().then(function () {
                                chai_1.assert.fail('should throw');
                            }).catch(function () {
                                sinon.assert.notCalled(configuration.setGDPREnabled);
                                sinon.assert.notCalled(configuration.setOptOutEnabled);
                                sinon.assert.notCalled(configuration.setOptOutRecorded);
                            });
                        });
                    });
                    describe('and consent has changed', function () {
                        var tests = [{
                                lastConsent: false,
                                storedConsent: true,
                                event: 'consent',
                                optOutEnabled: false,
                                optOutRecorded: true
                            }, {
                                lastConsent: true,
                                storedConsent: false,
                                event: 'optout',
                                optOutEnabled: true,
                                optOutRecorded: true
                            }, {
                                lastConsent: 'false',
                                storedConsent: true,
                                event: 'consent',
                                optOutEnabled: false,
                                optOutRecorded: true
                            }, {
                                lastConsent: 'true',
                                storedConsent: false,
                                event: 'optout',
                                optOutEnabled: true,
                                optOutRecorded: true
                            }];
                        tests.forEach(function (t) {
                            it("should send \"" + t.event + "\" when \"" + t.storedConsent + "\"", function () {
                                isGDPREnabled = true;
                                consentlastsent = t.lastConsent;
                                consent = t.storedConsent;
                                var writePromise = new Promise(function (resolve) {
                                    writeStub.reset();
                                    writeStub.callsFake(function () {
                                        return Promise.resolve().then(resolve);
                                    });
                                });
                                return gdprManager.getConsentAndUpdateConfiguration().then(function () {
                                    return writePromise.then(function () {
                                        sinon.assert.calledWith(getStub, Storage_1.StorageType.PUBLIC, 'gdpr.consent.value');
                                        sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent');
                                        if (t.event === 'optout') {
                                            sinon.assert.calledWithExactly(sendGDPREventStub, t.event, GdprManager_1.GDPREventSource.METADATA);
                                        }
                                        else {
                                            sinon.assert.calledWithExactly(sendGDPREventStub, t.event);
                                        }
                                        sinon.assert.calledWith(setStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent', t.storedConsent);
                                        sinon.assert.calledWith(writeStub, Storage_1.StorageType.PRIVATE);
                                        sinon.assert.calledWith(configuration.setOptOutEnabled, t.optOutEnabled);
                                        sinon.assert.calledWith(configuration.setOptOutRecorded, t.optOutRecorded);
                                    });
                                });
                            });
                        });
                        describe('and configuration isGDPREnabled is set to false during getConsentAndUpdateConfiguration', function () {
                            it('should not do anything', function () {
                                isGDPREnabled = true;
                                consentlastsent = false;
                                consent = true;
                                getStub.reset();
                                getStub.callsFake(function () {
                                    isGDPREnabled = false;
                                    return Promise.resolve(true);
                                });
                                return gdprManager.getConsentAndUpdateConfiguration().then(function (storedConsent) {
                                    chai_1.assert.equal(storedConsent, true);
                                    sinon.assert.calledWith(getStub, Storage_1.StorageType.PUBLIC, 'gdpr.consent.value');
                                    sinon.assert.notCalled(sendGDPREventStub);
                                    sinon.assert.notCalled(setStub);
                                    sinon.assert.notCalled(writeStub);
                                    sinon.assert.notCalled(configuration.setOptOutEnabled);
                                    sinon.assert.notCalled(configuration.setOptOutRecorded);
                                });
                            });
                        });
                        describe('and configuration isGDPREnabled is false', function () {
                            it('should not do anything', function () {
                                isGDPREnabled = false;
                                consentlastsent = false;
                                var writePromise = new Promise(function (resolve) {
                                    writeStub.reset();
                                    writeStub.callsFake(function () {
                                        return Promise.resolve().then(resolve);
                                    });
                                });
                                return gdprManager.getConsentAndUpdateConfiguration().then(function () {
                                    chai_1.assert.fail('should throw');
                                }).catch(function (error) {
                                    chai_1.assert.equal(error.message, 'Configuration gdpr is not enabled');
                                    sinon.assert.notCalled(getStub);
                                    sinon.assert.notCalled(sendGDPREventStub);
                                    sinon.assert.notCalled(setStub);
                                    sinon.assert.notCalled(writeStub);
                                    sinon.assert.notCalled(configuration.setOptOutEnabled);
                                    sinon.assert.notCalled(configuration.setOptOutRecorded);
                                });
                            });
                        });
                        describe('and last consent has not been stored', function () {
                            [[false, 'optout'], [true, 'consent']].forEach(function (_a) {
                                var userConsents = _a[0], event = _a[1];
                                it("should send and store the last consent for " + userConsents, function () {
                                    isGDPREnabled = true;
                                    getStub.withArgs(Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent').reset();
                                    getStub.withArgs(Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent').rejects('test error');
                                    var writePromise = new Promise(function (resolve) {
                                        writeStub.reset();
                                        writeStub.callsFake(function () {
                                            return Promise.resolve().then(resolve);
                                        });
                                    });
                                    consent = userConsents;
                                    return gdprManager.getConsentAndUpdateConfiguration().then(function () {
                                        return writePromise.then(function () {
                                            sinon.assert.calledWith(getStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent');
                                            if (event === 'optout') {
                                                sinon.assert.calledWithExactly(sendGDPREventStub, event, GdprManager_1.GDPREventSource.METADATA);
                                            }
                                            else {
                                                sinon.assert.calledWithExactly(sendGDPREventStub, event);
                                            }
                                            sinon.assert.calledWith(setStub, Storage_1.StorageType.PRIVATE, 'gdpr.consentlastsent', userConsents);
                                            sinon.assert.calledWith(writeStub, Storage_1.StorageType.PRIVATE);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
                describe('Fetch personal information', function () {
                    var getRequestStub;
                    var diagnosticTriggerStub;
                    var logErrorStub;
                    var gameId = '12345';
                    var adId = '12345678-9ABC-DEF0-1234-56789ABCDEF0';
                    var projectId = 'abcd-1234';
                    var stores = 'xiaomi,google';
                    var model = 'TestModel';
                    var countryCode = 'FI';
                    beforeEach(function () {
                        getRequestStub = request.get;
                        getRequestStub.resolves({ response: '{}' });
                        diagnosticTriggerStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger');
                        logErrorStub = nativeBridge.Sdk.logError;
                        clientInfo.getGameId.returns(gameId);
                        deviceInfo.getAdvertisingIdentifier.returns(adId);
                        deviceInfo.getStores.returns(stores);
                        deviceInfo.getModel.returns(model);
                        configuration.getUnityProjectId.returns(projectId);
                        configuration.getCountry.returns(countryCode);
                    });
                    afterEach(function () {
                        diagnosticTriggerStub.restore();
                    });
                    it('should call request.get', function () {
                        return gdprManager.retrievePersonalInformation().then(function () {
                            sinon.assert.calledWith(getRequestStub, "https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=" + gameId + "&adid=" + adId + "&projectId=" + projectId + "&storeId=" + stores);
                        });
                    });
                    it('verify response has personal payload', function () {
                        return gdprManager.retrievePersonalInformation().then(function (response) {
                            chai_1.assert.equal(response.deviceModel, model);
                            chai_1.assert.equal(response.country, countryCode);
                        });
                    });
                    it('should call diagnostics on error', function () {
                        getRequestStub.reset();
                        getRequestStub.rejects('Test Error');
                        return gdprManager.retrievePersonalInformation().then(function () {
                            chai_1.assert.fail('Should throw error');
                        }).catch(function (error) {
                            chai_1.assert.equal(error, 'Test Error');
                            sinon.assert.calledWith(diagnosticTriggerStub, 'gdpr_request_failed', { url: "https://tracking.adsx.unityads.unity3d.com/user-summary?gameId=" + gameId + "&adid=" + adId + "&projectId=" + projectId + "&storeId=" + stores });
                        });
                    });
                    it('should call logError on error', function () {
                        getRequestStub.reset();
                        getRequestStub.rejects('Test Error');
                        return gdprManager.retrievePersonalInformation().then(function () {
                            chai_1.assert.fail('Should throw error');
                        }).catch(function (error) {
                            chai_1.assert.equal(error, 'Test Error');
                            sinon.assert.calledWith(logErrorStub, 'Gdpr request failedTest Error');
                        });
                    });
                });
                describe('Sending gdpr events', function () {
                    var tests = [{
                            action: GdprManager_1.GDPREventAction.SKIP,
                            source: undefined,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'skip',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId
                            }
                        }, {
                            action: GdprManager_1.GDPREventAction.CONSENT,
                            source: undefined,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'consent',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId
                            }
                        }, {
                            action: GdprManager_1.GDPREventAction.OPTOUT,
                            source: undefined,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'optout',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId
                            }
                        }, {
                            action: GdprManager_1.GDPREventAction.OPTOUT,
                            source: GdprManager_1.GDPREventSource.METADATA,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'optout',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId,
                                'source': 'metadata'
                            }
                        }, {
                            action: GdprManager_1.GDPREventAction.OPTOUT,
                            source: GdprManager_1.GDPREventSource.USER,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'optout',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId,
                                'source': 'user'
                            }
                        }, {
                            action: GdprManager_1.GDPREventAction.OPTIN,
                            source: undefined,
                            infoJson: {
                                'adid': testAdvertisingId,
                                'action': 'optin',
                                'projectId': testUnityProjectId,
                                'platform': 'test',
                                'gameId': testGameId
                            }
                        }];
                    tests.forEach(function (t) {
                        it("should send matching payload when action is \"" + t.action + "\"", function () {
                            httpKafkaStub.resetHistory();
                            var comparison = function (value) {
                                if (Object.keys(value).length !== Object.keys(t.infoJson).length) {
                                    return false;
                                }
                                if (value.adid !== t.infoJson.adid) {
                                    return false;
                                }
                                if (value.action !== t.infoJson.action) {
                                    return false;
                                }
                                if (value.projectId !== t.infoJson.projectId) {
                                    return false;
                                }
                                if (value.platform !== t.infoJson.platform) {
                                    return false;
                                }
                                if (value.gameId !== t.infoJson.gameId) {
                                    return false;
                                }
                                if (value.source !== t.infoJson.source) {
                                    return false;
                                }
                                return true;
                            };
                            gdprManager.sendGDPREvent(t.action, t.source);
                            chai_1.assert.isTrue(comparison(httpKafkaStub.firstCall.args[2]), "expected infoJson " + JSON.stringify(t.infoJson) + "\nreceived infoJson " + JSON.stringify(httpKafkaStub.firstCall.args[2]));
                            httpKafkaStub.calledWithExactly('ads.events.optout.v1.json', HttpKafka_1.KafkaCommonObjectType.EMPTY, t.infoJson);
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2Rwck1hbmFnZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiR2Rwck1hbmFnZXJUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFxQkEsUUFBUSxDQUFDLGlCQUFpQixFQUFFO2dCQUN4QixJQUFNLFVBQVUsR0FBRyxPQUFPLENBQUM7Z0JBQzNCLElBQU0saUJBQWlCLEdBQUcsaUJBQWlCLENBQUM7Z0JBQzVDLElBQU0sa0JBQWtCLEdBQUcsUUFBUSxDQUFDO2dCQUNwQyxJQUFJLFlBQTBCLENBQUM7Z0JBQy9CLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxVQUFzQixDQUFDO2dCQUMzQixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksV0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxPQUFnQixDQUFDO2dCQUVyQixJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksT0FBd0IsQ0FBQztnQkFDN0IsSUFBSSxPQUF3QixDQUFDO2dCQUM3QixJQUFJLFNBQTBCLENBQUM7Z0JBQy9CLElBQUksaUJBQWlDLENBQUM7Z0JBQ3RDLElBQUksYUFBNkIsQ0FBQztnQkFFbEMsSUFBSSxlQUFlLEdBQXFCLEtBQUssQ0FBQztnQkFDOUMsSUFBSSxPQUFPLEdBQVEsS0FBSyxDQUFDO2dCQUN6QixJQUFJLGFBQWEsR0FBWSxLQUFLLENBQUM7Z0JBQ25DLElBQUksY0FBc0QsQ0FBQztnQkFFM0QsVUFBVSxDQUFDO29CQUNQLGVBQWUsR0FBRyxLQUFLLENBQUM7b0JBQ3hCLE9BQU8sR0FBRyxLQUFLLENBQUM7b0JBRWhCLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO29CQUN0RCxZQUFZLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFNLENBQUMsQ0FBQztvQkFDcEQsWUFBWSxDQUFDLE9B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