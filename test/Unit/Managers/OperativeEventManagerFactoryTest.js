System.register(["mocha", "chai", "sinon", "Managers/OperativeEventManagerFactory", "Native/NativeBridge", "Constants/Platform", "Utilities/Request", "Managers/MetaDataManager", "Managers/SessionManager", "Test/Unit/TestHelpers/TestFixtures", "Managers/PerformanceOperativeEventManager", "Managers/XPromoOperativeEventManager", "Managers/MRAIDOperativeEventManager", "Managers/OperativeEventManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, OperativeEventManagerFactory_1, NativeBridge_1, Platform_1, Request_1, MetaDataManager_1, SessionManager_1, TestFixtures_1, PerformanceOperativeEventManager_1, XPromoOperativeEventManager_1, MRAIDOperativeEventManager_1, OperativeEventManager_1;
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
            function (OperativeEventManagerFactory_1_1) {
                OperativeEventManagerFactory_1 = OperativeEventManagerFactory_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Request_1_1) {
                Request_1 = Request_1_1;
            },
            function (MetaDataManager_1_1) {
                MetaDataManager_1 = MetaDataManager_1_1;
            },
            function (SessionManager_1_1) {
                SessionManager_1 = SessionManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (PerformanceOperativeEventManager_1_1) {
                PerformanceOperativeEventManager_1 = PerformanceOperativeEventManager_1_1;
            },
            function (XPromoOperativeEventManager_1_1) {
                XPromoOperativeEventManager_1 = XPromoOperativeEventManager_1_1;
            },
            function (MRAIDOperativeEventManager_1_1) {
                MRAIDOperativeEventManager_1 = MRAIDOperativeEventManager_1_1;
            },
            function (OperativeEventManager_1_1) {
                OperativeEventManager_1 = OperativeEventManager_1_1;
            }
        ],
        execute: function () {
            describe('OperativeEventManagerFactoryTest', function () {
                var handleInvocation = sinon.spy();
                var handleCallback = sinon.spy();
                var nativeBridge;
                var request;
                var metaDataManager;
                var sessionManager;
                var clientInfo;
                var deviceInfo;
                var configuration;
                beforeEach(function () {
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    }, Platform_1.Platform.ANDROID);
                    request = sinon.createStubInstance(Request_1.Request);
                    sessionManager = sinon.createStubInstance(SessionManager_1.SessionManager);
                    metaDataManager = new MetaDataManager_1.MetaDataManager(nativeBridge);
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID);
                    deviceInfo = TestFixtures_1.TestFixtures.getAndroidDeviceInfo();
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                });
                describe('should return correct type of operative manager', function () {
                    it('with PerformanceCampaign', function () {
                        var campaign = TestFixtures_1.TestFixtures.getCampaign();
                        var manager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        chai_1.assert.isTrue(manager instanceof PerformanceOperativeEventManager_1.PerformanceOperativeEventManager, 'Manager not instance of PerformanceOperativeEventManager');
                    });
                    it('with XPromoCampaign', function () {
                        var campaign = TestFixtures_1.TestFixtures.getXPromoCampaign();
                        var manager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        chai_1.assert.isTrue(manager instanceof XPromoOperativeEventManager_1.XPromoOperativeEventManager, 'Manager not instance of XPromoOperativeEventManager');
                    });
                    it('with MRAIDCampaign', function () {
                        var campaign = TestFixtures_1.TestFixtures.getPlayableMRAIDCampaign();
                        var manager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        chai_1.assert.isTrue(manager instanceof MRAIDOperativeEventManager_1.MRAIDOperativeEventManager, 'Manager not instance of MRAIDOperativeEventManager');
                    });
                    it('with all other campaign types', function () {
                        var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        var manager = OperativeEventManagerFactory_1.OperativeEventManagerFactory.createOperativeEventManager({
                            nativeBridge: nativeBridge,
                            request: request,
                            metaDataManager: metaDataManager,
                            sessionManager: sessionManager,
                            clientInfo: clientInfo,
                            deviceInfo: deviceInfo,
                            configuration: configuration,
                            campaign: campaign
                        });
                        chai_1.assert.isTrue(manager instanceof OperativeEventManager_1.OperativeEventManager, 'Manager not instance of OperativeEventManager');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiT3BlcmF0aXZlRXZlbnRNYW5hZ2VyRmFjdG9yeVRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJPcGVyYXRpdmVFdmVudE1hbmFnZXJGYWN0b3J5VGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBbUJBLFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRTtnQkFDekMsSUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBQ3JDLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFbkMsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLE9BQWdCLENBQUM7Z0JBQ3JCLElBQUksZUFBZ0MsQ0FBQztnQkFDckMsSUFBSSxjQUE4QixDQUFDO2dCQUNuQyxJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksVUFBc0IsQ0FBQztnQkFDM0IsSUFBSSxhQUE0QixDQUFDO2dCQUVqQyxVQUFVLENBQUM7b0JBQ1AsWUFBWSxHQUFHLElBQUksMkJBQVksQ0FBQzt3QkFDNUIsZ0JBQWdCLGtCQUFBO3dCQUNoQixjQUFjLGdCQUFBO3FCQUNqQixFQUFFLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRXJCLE9BQU8sR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsaUJBQU8sQ0FBQyxDQUFDO29CQUM1QyxjQUFjLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLCtCQUFjLENBQUMsQ0FBQztvQkFDMUQsZUFBZSxHQUFHLElBQUksaUNBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDcEQsVUFBVSxHQUFHLDJCQUFZLENBQUMsYUFBYSxDQUFDLG1CQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzFELFVBQVUsR0FBRywyQkFBWSxDQUFDLG9CQUFvQixFQUFFLENBQUM7b0JBQ2pELGFBQWEsR0FBRywyQkFBWSxDQUFD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