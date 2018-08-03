System.register(["mocha", "chai", "sinon", "Models/Configuration", "Parsers/ConfigurationParser", "json/ConfigurationAuctionPlc.json", "json/ConfigurationPromoPlacements.json", "Models/ABGroup", "Constants/Platform", "Utilities/MixedPlacementUtility", "Test/Unit/TestHelpers/TestFixtures"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, Configuration_1, ConfigurationParser_1, ConfigurationAuctionPlc_json_1, ConfigurationPromoPlacements_json_1, ABGroup_1, Platform_1, MixedPlacementUtility_1, TestFixtures_1;
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
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (ConfigurationAuctionPlc_json_1_1) {
                ConfigurationAuctionPlc_json_1 = ConfigurationAuctionPlc_json_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (ABGroup_1_1) {
                ABGroup_1 = ABGroup_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (MixedPlacementUtility_1_1) {
                MixedPlacementUtility_1 = MixedPlacementUtility_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            }
        ],
        execute: function () {
            describe('configurationParserTest', function () {
                var configuration;
                describe('Parsing json to configuration', function () {
                    beforeEach(function () {
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationAuctionPlc_json_1.default));
                    });
                    it('should have enabled parameter from configuration', function () {
                        chai_1.assert.isTrue(configuration.isEnabled());
                    });
                    it('should have country parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getCountry(), 'FI');
                    });
                    it('should have coppaCompliant parameter from configuration', function () {
                        chai_1.assert.equal(configuration.isCoppaCompliant(), false);
                    });
                    it('should have abGroup parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getAbGroup(), ABGroup_1.ABGroupBuilder.getAbGroup(99));
                    });
                    it('should have properties parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getProperties(), 'abcdefgh12345678');
                    });
                    it('should have forced cache mode', function () {
                        chai_1.assert.equal(configuration.getCacheMode(), Configuration_1.CacheMode.FORCED);
                    });
                    it('should have projectId parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getUnityProjectId(), 'abcd-1234');
                    });
                    it('should have token parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getToken(), 'abcd.1234.5678');
                    });
                    it('should have organizationId parameter from configuration', function () {
                        chai_1.assert.equal(configuration.getOrganizationId(), '5552368');
                    });
                    it('should have gdprEnabled parameter from configuration', function () {
                        chai_1.assert.equal(configuration.isGDPREnabled(), false);
                    });
                    it('should have optOutRecorded parameter from configuration', function () {
                        chai_1.assert.equal(configuration.isOptOutRecorded(), false);
                    });
                    it('should have optOutEnabled parameter from configuration', function () {
                        chai_1.assert.equal(configuration.isOptOutEnabled(), false);
                    });
                    it('should have server side test mode false when undefined in config', function () {
                        chai_1.assert.equal(configuration.getTestMode(), false);
                    });
                    it('should have server side test mode true when defined in config', function () {
                        configuration.set('test', true);
                        chai_1.assert.equal(configuration.getTestMode(), true);
                    });
                    describe('parsing placements', function () {
                        it('should get all placements', function () {
                            chai_1.assert.property(configuration.getPlacements(), 'premium');
                            chai_1.assert.property(configuration.getPlacements(), 'video');
                            chai_1.assert.property(configuration.getPlacements(), 'mraid');
                            chai_1.assert.property(configuration.getPlacements(), 'rewardedVideoZone');
                        });
                        it('should pick default', function () {
                            chai_1.assert.equal(configuration.getDefaultPlacement().getId(), 'video');
                        });
                        it('should return placement by id', function () {
                            chai_1.assert.equal(configuration.getPlacement('premium').getName(), 'Premium placement');
                        });
                    });
                });
                describe('Parsing mixed placement json to configuration', function () {
                    var sandbox = sinon.createSandbox();
                    sandbox.stub(MixedPlacementUtility_1.MixedPlacementUtility, 'createMixedPlacements');
                    afterEach(function () {
                        MixedPlacementUtility_1.MixedPlacementUtility.originalPlacements = {};
                        sandbox.restore();
                    });
                    it('should only call createMixedPlacements if created placement is mixed and gameid is in mixed placement experiment', function () {
                        var clientInfoPromoGame = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID, '1003628');
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default), clientInfoPromoGame);
                        sandbox.assert.called(MixedPlacementUtility_1.MixedPlacementUtility.createMixedPlacements);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29uZmlndXJhdGlvblBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDb25maWd1cmF0aW9uUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBY0EsUUFBUSxDQUFDLHlCQUF5QixFQUFFO2dCQUVoQyxJQUFJLGFBQTRCLENBQUM7Z0JBRWpDLFFBQVEsQ0FBQywrQkFBK0IsRUFBRTtvQkFDdEMsVUFBVSxDQUFDO3dCQUNQLGFBQWEsR0FBRyx5Q0FBbUIsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQ0FBaUIsQ0FBQyxDQUFDLENBQUM7b0JBQzdFLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxrREFBa0QsRUFBRTt3QkFDbkQsYUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQztvQkFDN0MsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLGtEQUFrRCxFQUFFO3dCQUNuRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDbkQsQ0FBQyxDQUFDLENBQUM7b0JBRUgsRUFBRSxDQUFDLHlEQUF5RCxFQUFFO3dCQUMxRCxhQUFNLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUMxRCxDQUFDLENBQUMsQ0FBQztvQkFFSCxFQUFFLENBQUMsa0RBQWtELEVBQUU7d0JBQ25ELGFBQU0sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFVBQVUsRUFBRSxFQUFFLHdCQUFjLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7b0JBQzVFLENBQUMsQ0FBQyxDQUFDO29CQUVILEVBQUUsQ0FBQyxxREFBcUQsRUFBRTt3QkFDdEQsYUFBTSxDQUFDLEtB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