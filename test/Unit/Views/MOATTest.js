System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Views/MOAT", "../TestHelpers/TestFixtures", "Utilities/Diagnostics", "Native/Api/Sdk"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, MOAT_1, TestFixtures_1, Diagnostics_1, Sdk_1;
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
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (MOAT_1_1) {
                MOAT_1 = MOAT_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Diagnostics_1_1) {
                Diagnostics_1 = Diagnostics_1_1;
            },
            function (Sdk_1_1) {
                Sdk_1 = Sdk_1_1;
            }
        ],
        execute: function () {
            describe('MOAT', function () {
                describe('onMessage', function () {
                    var diagnosticsTriggerStub;
                    var logWarningStub;
                    var moat;
                    beforeEach(function () {
                        var nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                        var sdk = sinon.createStubInstance(Sdk_1.SdkApi);
                        nativeBridge.Sdk = sdk;
                        logWarningStub = sdk.logWarning;
                        moat = new MOAT_1.MOAT(nativeBridge);
                        diagnosticsTriggerStub = sinon.stub(Diagnostics_1.Diagnostics, 'trigger');
                    });
                    afterEach(function () {
                        diagnosticsTriggerStub.restore();
                    });
                    var tests = [{
                            event: { data: { type: 'MOATVideoError', error: 'test error' } },
                            assertions: function () {
                                sinon.assert.calledWithExactly(diagnosticsTriggerStub, 'moat_video_error', 'test error');
                            }
                        }, {
                            event: { data: { type: 'loaded' } },
                            assertions: function () {
                                sinon.assert.notCalled(diagnosticsTriggerStub);
                            }
                        }, {
                            event: { data: {} },
                            assertions: function () {
                                sinon.assert.notCalled(logWarningStub);
                                sinon.assert.notCalled(diagnosticsTriggerStub);
                            }
                        }, {
                            event: { data: { type: 'test' } },
                            assertions: function () {
                                sinon.assert.calledWithExactly(logWarningStub, 'MOAT Unknown message type test');
                                sinon.assert.notCalled(diagnosticsTriggerStub);
                            }
                        }];
                    tests.forEach(function (test) {
                        it('should pass assertions', function () {
                            moat.onMessage(test.event);
                            test.assertions();
                        });
                    });
                });
            });
            // disable all because failing hybrid tests for android devices that dont support html5
            xdescribe('MOAT View', function () {
                var nativeBridge;
                var moat;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    moat = new MOAT_1.MOAT(nativeBridge);
                });
                // disabled because failing hybrid tests for android devices that dont support html5
                xdescribe('render', function () {
                    beforeEach(function () {
                        moat.render();
                        document.body.appendChild(moat.container());
                    });
                    it('should include moat container in the moat iframe', function () {
                        var iframe = moat.container().querySelector('iframe');
                        var srcdoc = iframe.getAttribute('srcdoc');
                        chai_1.assert.isNotNull(srcdoc);
                        chai_1.assert.isNotNull(moat.container().innerHTML);
                        chai_1.assert.isTrue(srcdoc.indexOf(moat.container().querySelector('iframe').innerHTML) !== -1);
                    });
                });
                describe('init', function () {
                    var iframe;
                    var fakeMoatIds;
                    var fakeMoatData;
                    var messageListener;
                    beforeEach(function () {
                        moat.render();
                        messageListener = sinon.spy();
                        iframe = moat.container().querySelector('iframe');
                        document.body.appendChild(moat.container());
                        iframe.contentWindow.addEventListener('message', messageListener);
                        fakeMoatIds = {
                            level1: 1,
                            level2: 'test',
                            level3: 'test',
                            level4: 'test',
                            slicer1: 'test',
                            slicer2: 'test',
                            slicer3: 'test'
                        };
                        fakeMoatData = {
                            SDK: 'test',
                            Version: 'test',
                            SDKVersion: 'test',
                            LimitAdTracking: false,
                            COPPA: true,
                            bundle: 'test'
                        };
                        moat.init(fakeMoatIds, 1, 'https://test.com', fakeMoatData, 1);
                    });
                    afterEach(function () {
                        document.body.removeChild(moat.container());
                        moat.hide();
                    });
                    it('should send the init message', function () {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                try {
                                    sinon.assert.called(messageListener);
                                    var e = messageListener.getCall(0).args[0];
                                    chai_1.assert.equal(e.data.type, 'init', 'Passed in event was not "init"');
                                    resolve();
                                }
                                catch (e) {
                                    reject(e);
                                }
                            });
                        });
                    });
                });
                describe('triggering video event', function () {
                    var iframe;
                    var messageListener;
                    beforeEach(function () {
                        moat.render();
                        messageListener = sinon.spy();
                        iframe = moat.container().querySelector('iframe');
                        document.body.appendChild(moat.container());
                        iframe.contentWindow.addEventListener('message', messageListener);
                        moat.triggerVideoEvent('test', 1);
                    });
                    it('should fire the video message', function () {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                try {
                                    sinon.assert.called(messageListener);
                                    var e = messageListener.getCall(0).args[0];
                                    chai_1.assert.equal(e.data.type, 'videoEvent', 'Passed in event was not "videoEvent"');
                                    resolve();
                                }
                                catch (e) {
                                    reject(e);
                                }
                            });
                        });
                    });
                });
                describe('triggering viewability event', function () {
                    var iframe;
                    var messageListener;
                    beforeEach(function () {
                        moat.render();
                        messageListener = sinon.spy();
                        iframe = moat.container().querySelector('iframe');
                        document.body.appendChild(moat.container());
                        iframe.contentWindow.addEventListener('message', messageListener);
                        moat.triggerViewabilityEvent('testViewabilityEvent', 'test');
                    });
                    it('should fire the viewability message of the specified type', function () {
                        return new Promise(function (resolve, reject) {
                            setTimeout(function () {
                                try {
                                    sinon.assert.called(messageListener);
                                    var e = messageListener.getCall(0).args[0];
                                    chai_1.assert.equal(e.data.type, 'testViewabilityEvent', 'Passed in event was not "testViewabilityEvent"');
                                    resolve();
                                }
                                catch (e) {
                                    reject(e);
                                }
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTU9BVFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJNT0FUVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBVUEsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDYixRQUFRLENBQUMsV0FBVyxFQUFFO29CQUNsQixJQUFJLHNCQUF1QyxDQUFDO29CQUM1QyxJQUFJLGNBQStCLENBQUM7b0JBQ3BDLElBQUksSUFBUyxDQUFDO29CQUNkLFVBQVUsQ0FBQzt3QkFDUCxJQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsMkJBQVksQ0FBQyxDQUFDO3dCQUM1RCxJQUFNLEdBQUcsR0FBVyxLQUFLLENBQUMsa0JBQWtCLENBQUMsWUFBTSxDQUFDLENBQUM7d0JBQ3JELFlBQVksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO3dCQUN2QixjQUFjLEdBQXFCLEdBQUcsQ0FBQyxVQUFVLENBQUM7d0JBQ2xELElBQUksR0FBRyxJQUFJLFdBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQzt3QkFDOUIsc0JBQXNCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyx5QkFBVyxFQUFFLFNBQVMsQ0FBQyxDQUFDO29CQUNoRSxDQUFDLENBQUMsQ0FBQztvQkFFSCxTQUFTLENBQUM7d0JBQ04sc0JBQXNCLENBQUMsT0FBTyxFQUFFLENBQUM7b0JBQ3JDLENBQUMsQ0FBQyxDQUFDO29CQUlILElBQU0sS0FBSyxHQUdOLENBQUM7NEJBQ0YsS0FBSyxFQUFFLEVBQUMsSUFBSSxFQUFFLEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxZQUFZLEVBQUMsRUFBQzs0QkFDNUQsVUFBVSxFQUFFO2dDQUNSLEtBQUssQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUUsa0JBQWtCLEVBQUUsWUFBWSxDQUFDLENBQUM7NEJBQzdGLENBQUM7eUJBQ0osRUFBRTs0QkFDQyxLQUFL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