System.register(["mocha", "chai", "Utilities/MixedPlacementUtility", "Parsers/ConfigurationParser", "json/MixedPlacementAuctionResponse.json", "json/ConfigurationPromoPlacements.json", "Test/Unit/TestHelpers/TestFixtures", "Constants/Platform", "Models/Placement"], function (exports_1, context_1) {
    "use strict";
    var chai_1, MixedPlacementUtility_1, ConfigurationParser_1, MixedPlacementAuctionResponse_json_1, ConfigurationPromoPlacements_json_1, TestFixtures_1, Platform_1, Placement_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (MixedPlacementUtility_1_1) {
                MixedPlacementUtility_1 = MixedPlacementUtility_1_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (MixedPlacementAuctionResponse_json_1_1) {
                MixedPlacementAuctionResponse_json_1 = MixedPlacementAuctionResponse_json_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            }
        ],
        execute: function () {
            describe('MixedPlacementUtilities', function () {
                var configuration;
                var promoSkippableCampaign;
                var promoNonSkippableCampaign;
                var interstitialCampaign;
                var clientInfo;
                var configurationPromoPlacementsJson;
                var campaignRawPlacements;
                beforeEach(function () {
                    clientInfo = TestFixtures_1.TestFixtures.getClientInfo(Platform_1.Platform.ANDROID, '1543512');
                    configurationPromoPlacementsJson = JSON.parse(ConfigurationPromoPlacements_json_1.default);
                    configuration = ConfigurationParser_1.ConfigurationParser.parse(configurationPromoPlacementsJson, clientInfo);
                    interstitialCampaign = TestFixtures_1.TestFixtures.getDisplayInterstitialCampaign();
                    promoSkippableCampaign = TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap', true);
                    promoNonSkippableCampaign = TestFixtures_1.TestFixtures.getPromoCampaign('purchasing/iap', false);
                    campaignRawPlacements = JSON.parse(MixedPlacementAuctionResponse_json_1.default).placements;
                });
                describe('isMixedPlacement', function () {
                    it('should return true for a mixed placement', function () {
                        var placement = configuration.getPlacement('mixedPlacement');
                        chai_1.assert.isTrue(MixedPlacementUtility_1.MixedPlacementUtility.isMixedPlacement(placement));
                    });
                    it('should return false for a non-mixed placement', function () {
                        var placement = configuration.getPlacement('premium');
                        chai_1.assert.isFalse(MixedPlacementUtility_1.MixedPlacementUtility.isMixedPlacement(placement));
                    });
                });
                describe('insertMediaIdsIntoJSON', function () {
                    it('should create additional placements within raw campaign json response associated with the correct media ids', function () {
                        var jsonMixedPlacements = MixedPlacementUtility_1.MixedPlacementUtility.insertMediaIdsIntoJSON(configuration, campaignRawPlacements);
                        var getMixedPlacementTypeList = 'getMixedPlacementTypeList';
                        var suffixList = MixedPlacementUtility_1.MixedPlacementUtility[getMixedPlacementTypeList]();
                        for (var _i = 0, suffixList_1 = suffixList; _i < suffixList_1.length; _i++) {
                            var suffix = suffixList_1[_i];
                            chai_1.assert.equal(jsonMixedPlacements['mixedPlacement' + suffix], '1111111111111111111111');
                        }
                        chai_1.assert.equal(jsonMixedPlacements['video' + ''], '000000000000000000000000');
                        chai_1.assert.lengthOf(Object.keys(jsonMixedPlacements), 5);
                    });
                });
                describe('extractMixedPlacementSuffix', function () {
                    var extractMixedPlacementSuffix = 'extractMixedPlacementSuffix';
                    it('should return an empty string when placement is not mixed', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('video').getId(), TestFixtures_1.TestFixtures.getCampaign(), configuration);
                        chai_1.assert.equal(result, '');
                    });
                    it('should return empty string when placement is mixed, allows skip in configuration, and is not a promo campaign', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getId(), TestFixtures_1.TestFixtures.getCampaign(), configuration);
                        chai_1.assert.equal(result, '');
                    });
                    it('should return -rewarded when placement is mixed, nonskippable in config, and campaign is not a promo', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement').getId(), TestFixtures_1.TestFixtures.getCampaign(), configuration);
                        chai_1.assert.equal(result, '-rewarded');
                    });
                    it('should return -promo when placement is mixed, does not allow skip in campaign, and campaign is promo ', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement').getId(), promoNonSkippableCampaign, configuration);
                        chai_1.assert.equal(result, '-promo');
                    });
                    it('should return -rewardedpromo when placement is mixed, allows skip in campaign, and is a promo campaign', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('rewardedPromoPlacement-rewardedpromo').getId(), promoSkippableCampaign, configuration);
                        chai_1.assert.equal(result, '-rewardedpromo');
                    });
                    it('should return -promo when placement is mixed, does not allow skip in campaign, and campaign is promo even if allows skip in config is true', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('skippableMixedPlacement').getId(), promoNonSkippableCampaign, configuration);
                        chai_1.assert.equal(result, '-promo');
                    });
                    it('should return -rewardedpromo when placement is mixed, allows skip in campaign, and is a promo campaign, even if allows skip in config is false', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[extractMixedPlacementSuffix](configuration.getPlacement('mixedPlacement-promo').getId(), promoSkippableCampaign, configuration);
                        chai_1.assert.equal(result, '-rewardedpromo');
                    });
                });
                describe('hasMixedPlacementSuffix', function () {
                    var hasMixedPlacementSuffix = 'hasMixedPlacementSuffix';
                    it('should return false if there is no mixedType suffix at the end of the placementid', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('mixedPlacement', configuration);
                        chai_1.assert.isFalse(result);
                    });
                    it('should return false if there is a dash suffix but is not mixedType', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('mixedPlacement-withdashes', configuration);
                        chai_1.assert.isFalse(result);
                    });
                    it('should return false if there is multiple dash suffixes but is not mixedType', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('promoPlacement-withdashes-booyah', configuration);
                        chai_1.assert.isFalse(result);
                    });
                    it('should return false if there is a dash separated mixed type that is not at the end of the placementid', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-promo-boo', configuration);
                        chai_1.assert.isFalse(result);
                    });
                    it('should return false if placement has dash separated mixed type but base id does not exist in configuration placement map', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('scooterPlacement-promo-promo', configuration);
                        chai_1.assert.isFalse(result);
                    });
                    it('should return true if placement includes at least one of the mixed placement suffixes at the end', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-rewarded', configuration);
                        chai_1.assert.isTrue(result);
                    });
                    it('should return true if a placementid already includes a dash and at least one of the mixed placement suffixes at the end', function () {
                        var result = MixedPlacementUtility_1.MixedPlacementUtility[hasMixedPlacementSuffix]('testDashPlacement-promo-promo', configuration);
                        chai_1.assert.isTrue(result);
                    });
                });
                describe('shouldFillMixedPlacement', function () {
                    context('handle non promo campaign', function () {
                        context('where the configuration is skippable', function () {
                            it('should return true for a non-rewarded placement', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement', configuration, interstitialCampaign);
                                chai_1.assert.isTrue(result);
                            });
                            it('should return false for a placement with a promo suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-promo', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                            it('should return false for a placement with a rewarded promo suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                            it('should return false for a placement with a rewarded suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('skippableMixedPlacement-rewarded', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                        });
                        context('where the configuration is non skippable', function () {
                            it('should return true for a placement with the rewarded suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, interstitialCampaign);
                                chai_1.assert.isTrue(result);
                            });
                            it('should return false for a non rewarded placement', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                            it('should return false for a placement with a rewarded promo suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                            it('should return false for a placement with a promo suffix', function () {
                                var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, interstitialCampaign);
                                chai_1.assert.isFalse(result);
                            });
                        });
                    });
                    context('handle promo campaign', function () {
                        context('where the auction is skippable', function () {
                            context('where the configuration is skippable', function () {
                                it('should return true for a placement with the rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                                    chai_1.assert.isTrue(result);
                                });
                                it('should return false for a placement with a promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a rewarded suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a non rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                            });
                            context('where the configuration is non-skippable', function () {
                                it('should return true for a placement with the rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoSkippableCampaign);
                                    chai_1.assert.isTrue(result);
                                });
                                it('should return false for a placement with a promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a non rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                            });
                        });
                        context('where the auction is non skippable', function () {
                            context('where the configuration is skippable', function () {
                                it('should return true for a placement with the promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isTrue(result);
                                });
                                it('should return false for a placement with a rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewardedpromo', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a non rewarded suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a non rewarded suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                            });
                            context('where the configuration is non-skippable', function () {
                                it('should return true for a placement with the promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-promo', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isTrue(result);
                                });
                                it('should return false for a placement with a rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a rewarded suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement-rewarded', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                                it('should return false for a placement with a non rewarded promo suffix', function () {
                                    var result = MixedPlacementUtility_1.MixedPlacementUtility.shouldFillMixedPlacement('mixedPlacement', configuration, promoNonSkippableCampaign);
                                    chai_1.assert.isFalse(result);
                                });
                            });
                        });
                    });
                });
                describe('createMixedPlacements', function () {
                    it('should update the placements map by adding in additional mixed placement', function () {
                        var placements = {};
                        var rawPlacement = configurationPromoPlacementsJson.placements[3];
                        MixedPlacementUtility_1.MixedPlacementUtility.createMixedPlacements(rawPlacement, placements);
                        rawPlacement.id = 'promoPlacement';
                        var expectedPlacementNonRewarded = new Placement_1.Placement(rawPlacement);
                        rawPlacement.id = 'promoPlacement-rewarded';
                        var expectedPlacementRewarded = new Placement_1.Placement(rawPlacement);
                        rawPlacement.id = 'promoPlacement-promo';
                        var expectedPlacementPromo = new Placement_1.Placement(rawPlacement);
                        rawPlacement.id = 'promoPlacement-rewardedpromo';
                        var expectedPlacementRewardedPromo = new Placement_1.Placement(rawPlacement);
                        var expectedPlacements = {
                            'promoPlacement': expectedPlacementNonRewarded,
                            'promoPlacement-promo': expectedPlacementPromo,
                            'promoPlacement-rewarded': expectedPlacementRewarded,
                            'promoPlacement-rewardedpromo': expectedPlacementRewardedPromo
                        };
                        chai_1.assert.deepEqual(placements, expectedPlacements);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTWl4ZWRQbGFjZW1lbnRVdGlsaXR5VGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIk1peGVkUGxhY2VtZW50VXRpbGl0eVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQWNBLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRTtnQkFFaEMsSUFBSSxhQUE0QixDQUFDO2dCQUNqQyxJQUFJLHNCQUFxQyxDQUFDO2dCQUMxQyxJQUFJLHlCQUF3QyxDQUFDO2dCQUM3QyxJQUFJLG9CQUFpRCxDQUFDO2dCQUN0RCxJQUFJLFVBQXNCLENBQUM7Z0JBQzNCLElBQUksZ0NBQXFDLENBQUM7Z0JBQzFDLElBQUkscUJBQTBELENBQUM7Z0JBRS9ELFVBQVUsQ0FBQztvQkFDUCxVQUFVLEdBQUcsMkJBQVksQ0FBQyxhQUFhLENBQUMsbUJBQVEsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ3JFLGdDQUFnQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsMkNBQTRCLENBQUMsQ0FBQztvQkFDNUUsYUFBYSxHQUFHLHlDQUFtQixDQUFDLEtBQUssQ0FBQyxnQ0FBZ0MsRUFBRSxVQUFVLENBQUMsQ0FBQztvQkFDeEYsb0JBQW9CLEdBQUcsMkJBQVksQ0FBQyw4QkFBOEIsRUFBRSxDQUFDO29CQUNyRSxzQkFBc0IsR0FBRywyQkFBWSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO29CQUMvRSx5QkFBeUIsR0FBRywyQkFBWSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUNuRixxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLDRDQUE2QixDQUFDLENBQUMsVUFBVSxDQUFDO2dCQUNqRixDQUFDLENBQUMsQ0FBQztnQkFFSCxRQUFRLENBQUMsa0JBQWtCLEVBQUU7b0JBQ3pCLEVBQUUsQ0FBQywwQ0FBMEMsRUFB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