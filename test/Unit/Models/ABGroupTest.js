System.register(["mocha", "chai", "sinon", "Models/ABGroup", "WebView", "Native/NativeBridge", "Utilities/TestEnvironment", "Managers/ConfigManager"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, ABGroup_1, WebView_1, NativeBridge_1, TestEnvironment_1, ConfigManager_1;
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
            function (ABGroup_1_1) {
                ABGroup_1 = ABGroup_1_1;
            },
            function (WebView_1_1) {
                WebView_1 = WebView_1_1;
            },
            function (NativeBridge_1_1) {
                NativeBridge_1 = NativeBridge_1_1;
            },
            function (TestEnvironment_1_1) {
                TestEnvironment_1 = TestEnvironment_1_1;
            },
            function (ConfigManager_1_1) {
                ConfigManager_1 = ConfigManager_1_1;
            }
        ],
        execute: function () {
            describe('ABGroupBuilder tests', function () {
                describe('getAbGroup', function () {
                    it('should give a valid group for numbers between 0-19', function () {
                        for (var i = 0; i < 20; i++) {
                            var abGroup = ABGroup_1.ABGroupBuilder.getAbGroup(i);
                            chai_1.assert.notEqual(abGroup.toNumber(), -1);
                            chai_1.assert.equal(abGroup.toNumber(), i);
                        }
                    });
                    it('should give a valid group for 99', function () {
                        var abGroup = ABGroup_1.ABGroupBuilder.getAbGroup(99);
                        chai_1.assert.notEqual(abGroup.toNumber(), -1);
                        chai_1.assert.equal(abGroup.toNumber(), 99);
                    });
                    it('should give group none when not valid', function () {
                        var abGroup = ABGroup_1.ABGroupBuilder.getAbGroup(20);
                        chai_1.assert.equal(abGroup.toNumber(), -1);
                    });
                });
            });
            describe('ABGroup tests', function () {
                // Example test of ABTest
                // describe('GdprBaseAbTest.isValid', () => {
                //     it('should return true for group 16', () => {
                //         const abGroup = ABGroupBuilder.getAbGroup(16);
                //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
                //     });
                //     it('should return true for group 17', () => {
                //         const abGroup = ABGroupBuilder.getAbGroup(17);
                //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
                //     });
                //     it('should return false for all groups not 16 and 17', () => {
                //         for (let i = -1; i < 100; i++) {
                //             if (i !== 16 && i !== 17) {
                //                 const abGroup = ABGroupBuilder.getAbGroup(i);
                //                 assert.isFalse(GdprBaseAbTest.isValid(abGroup));
                //             }
                //         }
                //     });
                // });
                describe('setupTestEnvironment in webview should set AbGroup on ConfigManager and CampaignManager', function () {
                    var tests = [{
                            metaDataGroup: '5',
                            expectedGroup: 5
                        }, {
                            metaDataGroup: 'garbage',
                            expectedGroup: undefined
                        }, {
                            metaDataGroup: undefined,
                            expectedGroup: undefined
                        }];
                    tests.forEach(function (t) {
                        it("expected group is " + t.expectedGroup + " and the metadata group is " + t.metaDataGroup, function () {
                            var nativeBridge = sinon.createStubInstance(NativeBridge_1.NativeBridge);
                            var webview = new WebView_1.WebView(nativeBridge);
                            var setupStub = sinon.stub(TestEnvironment_1.TestEnvironment, 'setup').resolves();
                            var getStub = sinon.stub(TestEnvironment_1.TestEnvironment, 'get');
                            getStub.withArgs('abGroup').returns(t.metaDataGroup);
                            var promise = webview.setupTestEnvironment();
                            return promise.then(function () {
                                sinon.assert.calledWith(getStub, 'abGroup');
                                var configAbGroupNumber;
                                var configManager = ConfigManager_1.ConfigManager;
                                var maybeGroup = configManager.AbGroup;
                                if (maybeGroup) {
                                    configAbGroupNumber = maybeGroup.toNumber();
                                }
                                chai_1.assert.equal(configAbGroupNumber, t.expectedGroup);
                                configManager.AbGroup = undefined;
                                getStub.restore();
                                setupStub.restore();
                            }).catch(function (error) {
                                ConfigManager_1.ConfigManager.AbGroup = undefined;
                                getStub.restore();
                                setupStub.restore();
                                throw error;
                            });
                        });
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQUJHcm91cFRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJBQkdyb3VwVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBV0EsUUFBUSxDQUFDLHNCQUFzQixFQUFFO2dCQUM3QixRQUFRLENBQUMsWUFBWSxFQUFFO29CQUNuQixFQUFFLENBQUMsb0RBQW9ELEVBQUU7d0JBQ3JELEtBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUU7NEJBQ3hCLElBQU0sT0FBTyxHQUFHLHdCQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUM3QyxhQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUN4QyxhQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQzt5QkFDdkM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGtDQUFrQyxFQUFFO3dCQUNuQyxJQUFNLE9BQU8sR0FBRyx3QkFBYyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQzt3QkFDOUMsYUFBTSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFDeEMsYUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsUUFBUSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyx1Q0FBdUMsRUFBRTt3QkFDeEMsSUFBTSxPQUFPLEdBQUcsd0JBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzlDLGFBQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFF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