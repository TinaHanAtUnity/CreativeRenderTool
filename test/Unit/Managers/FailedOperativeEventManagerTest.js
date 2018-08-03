System.register(["mocha", "chai", "sinon", "Native/NativeBridge", "Utilities/Request", "Managers/WakeUpManager", "Managers/FocusManager", "Managers/FailedOperativeEventManager", "Native/Api/Storage", "Utilities/HttpKafka", "Managers/FailedXpromoOperativeEventManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, NativeBridge_1, Request_1, WakeUpManager_1, FocusManager_1, FailedOperativeEventManager_1, Storage_1, HttpKafka_1, FailedXpromoOperativeEventManager_1;
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
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (WakeUpManager_1_1) {
                WakeUpManager_1 = WakeUpManager_1_1;
            },
            function (FocusManager_1_1) {
                FocusManager_1 = FocusManager_1_1;
            },
            function (FailedOperativeEventManager_1_1) {
                FailedOperativeEventManager_1 = FailedOperativeEventManager_1_1;
            },
            function (Storage_1_1) {
                Storage_1 = Storage_1_1;
            },
            function (HttpKafka_1_1) {
                HttpKafka_1 = HttpKafka_1_1;
            },
            function (FailedXpromoOperativeEventManager_1_1) {
                FailedXpromoOperativeEventManager_1 = FailedXpromoOperativeEventManager_1_1;
            }
        ],
        execute: function () {
            describe('FailedOperativeEventManagerTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var request;
                var focusManager;
                var wakeUpManager;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    focusManager = new FocusManager_1.FocusManager(nativeBridge);
                    wakeUpManager = new WakeUpManager_1.WakeUpManager(nativeBridge, focusManager);
                    request = new Request_1.Request(nativeBridge, wakeUpManager);
                });
                describe('Handling failed events', function () {
                    beforeEach(function () {
                        sinon.stub(nativeBridge.Storage, 'getKeys').callsFake(function () {
                            return Promise.resolve(['event1', 'event2']);
                        });
                        sinon.stub(request, 'post').callsFake(function () {
                            return Promise.resolve();
                        });
                        sinon.stub(nativeBridge.Storage, 'get').callsFake(function () {
                            return Promise.resolve({ url: 'http://test.url', data: '{\"testdata\": \"test\"}' });
                        });
                        sinon.stub(nativeBridge.Storage, 'delete').callsFake(function () {
                            return Promise.resolve();
                        });
                        sinon.stub(nativeBridge.Storage, 'write').callsFake(function () {
                            return Promise.resolve();
                        });
                    });
                    describe('Resending', function () {
                        describe('Performance events', function () {
                            it('Should send single event', function () {
                                var manager = new FailedOperativeEventManager_1.FailedOperativeEventManager('12345', '12345');
                                return manager.sendFailedEvent(nativeBridge, request, true).then(function () {
                                    sinon.assert.calledOnce(request.post);
                                    sinon.assert.calledWith(request.post, 'http://test.url', '{\"testdata\": \"test\"}');
                                    sinon.assert.calledOnce(nativeBridge.Storage.get);
                                    sinon.assert.calledWith(nativeBridge.Storage.get, Storage_1.StorageType.PRIVATE, 'session.12345.operative.12345');
                                    sinon.assert.calledOnce(nativeBridge.Storage.delete);
                                    sinon.assert.calledWith(nativeBridge.Storage.delete, Storage_1.StorageType.PRIVATE, 'session.12345.operative.12345');
                                    sinon.assert.calledOnce(nativeBridge.Storage.write);
                                });
                            });
                            it('Should send multiple events', function () {
                                var manager = new FailedOperativeEventManager_1.FailedOperativeEventManager('12345');
                                return manager.sendFailedEvents(nativeBridge, request).then(function () {
                                    sinon.assert.calledOnce(nativeBridge.Storage.getKeys);
                                    sinon.assert.calledTwice(nativeBridge.Storage.get);
                                    sinon.assert.calledTwice(nativeBridge.Storage.delete);
                                    chai_1.assert.equal(nativeBridge.Storage.delete.getCall(0).args[1], 'session.12345.operative.event1');
                                    chai_1.assert.equal(nativeBridge.Storage.delete.getCall(1).args[1], 'session.12345.operative.event2');
                                    sinon.assert.calledOnce(nativeBridge.Storage.write);
                                });
                            });
                            it('Should not send event without eventId', function () {
                                var manager = new FailedOperativeEventManager_1.FailedOperativeEventManager('12345');
                                return manager.sendFailedEvent(nativeBridge, request, true).then(function () {
                                    sinon.assert.notCalled(nativeBridge.Storage.get);
                                    sinon.assert.notCalled(request.post);
                                    sinon.assert.notCalled(nativeBridge.Storage.write);
                                    sinon.assert.notCalled(nativeBridge.Storage.delete);
                                });
                            });
                        });
                        describe('Xpromo events', function () {
                            it('Single event', function () {
                                nativeBridge.Storage.get.restore();
                                sinon.stub(nativeBridge.Storage, 'get').callsFake(function () {
                                    return Promise.resolve({ kafkaType: 'test.kafka.type', data: '{\"testdata\": \"test\"}' });
                                });
                                HttpKafka_1.HttpKafka.setRequest(request);
                                var manager = new FailedXpromoOperativeEventManager_1.FailedXpromoOperativeEventManager('12345', '12345');
                                return manager.sendFailedEvent(nativeBridge, request, true).then(function () {
                                    sinon.assert.calledOnce(request.post);
                                    sinon.assert.calledWith(request.post, 'https://httpkafka.unityads.unity3d.com/v1/events');
                                    sinon.assert.calledOnce(nativeBridge.Storage.get);
                                    sinon.assert.calledWith(nativeBridge.Storage.get, Storage_1.StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                                    sinon.assert.calledOnce(nativeBridge.Storage.delete);
                                    sinon.assert.calledWith(nativeBridge.Storage.delete, Storage_1.StorageType.PRIVATE, 'session.12345.xpromooperative.12345');
                                    sinon.assert.calledOnce(nativeBridge.Storage.write);
                                });
                            });
                        });
                    });
                    describe('Storing', function () {
                        beforeEach(function () {
                            sinon.stub(nativeBridge.Storage, 'set').callsFake(function () {
                                return Promise.resolve();
                            });
                        });
                        it('Single event', function () {
                            var manager = new FailedOperativeEventManager_1.FailedOperativeEventManager('12345', '12345');
                            return manager.storeFailedEvent(nativeBridge, { test1: 'test1', test2: 'test2' }).then(function () {
                                sinon.assert.calledOnce(nativeBridge.Storage.set);
                                sinon.assert.calledWith(nativeBridge.Storage.set, Storage_1.StorageType.PRIVATE, 'session.12345.operative.12345', { test1: 'test1', test2: 'test2' });
                                sinon.assert.calledOnce(nativeBridge.Storage.write);
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRmFpbGVkT3BlcmF0aXZlRXZlbnRNYW5hZ2VyVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkZhaWxlZE9wZXJhdGl2ZUV2ZW50TWFuYWdlclRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWFBLFFBQVEsQ0FBQyxpQ0FBaUMsRUFBRTtnQkFDeEMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFDbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxhQUE0QixDQUFDO2dCQUVqQyxVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixDQUFDLENBQUM7b0JBRUgsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDOUMsYUFBYSxHQUFHLElBQUksNkJBQWEsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUM7b0JBQzlELE9BQU8sR0FBRyxJQUFJLGlCQUFPLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO2dCQUN2RCxDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsd0JBQXdCLEVBQUU7b0JBQy9CLFVBQVUsQ0FBQzt3QkFDUCxLQUFLLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUMsU0FBUyxDQUFDOzRCQUNsRCxPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDakQsQ0FBQyxDQUFDLENBQUM7d0JBQ0gs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