System.register(["mocha", "chai", "sinon", "Managers/PlacementManager", "../TestHelpers/TestFixtures", "Native/Api/Placement", "Native/Api/Listener", "Models/Placement", "Parsers/ConfigurationParser", "json/ConfigurationPromoPlacements.json", "Parsers/PromoCampaignParser"], function (exports_1, context_1) {
    "use strict";
    var chai_1, sinon, PlacementManager_1, TestFixtures_1, Placement_1, Listener_1, Placement_2, ConfigurationParser_1, ConfigurationPromoPlacements_json_1, PromoCampaignParser_1;
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
            function (PlacementManager_1_1) {
                PlacementManager_1 = PlacementManager_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (Listener_1_1) {
                Listener_1 = Listener_1_1;
            },
            function (Placement_2_1) {
                Placement_2 = Placement_2_1;
            },
            function (ConfigurationParser_1_1) {
                ConfigurationParser_1 = ConfigurationParser_1_1;
            },
            function (ConfigurationPromoPlacements_json_1_1) {
                ConfigurationPromoPlacements_json_1 = ConfigurationPromoPlacements_json_1_1;
            },
            function (PromoCampaignParser_1_1) {
                PromoCampaignParser_1 = PromoCampaignParser_1_1;
            }
        ],
        execute: function () {
            describe('PlacementManagerTest', function () {
                var nativeBridge;
                var configuration;
                beforeEach(function () {
                    nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                });
                describe('addCampaignPlacementIds', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                    sinon.stub(campaign, 'getAdType').returns('purchasing/iap');
                    it('should add passed placementid and campaign to the placementCampaignMap', function () {
                        placementManager.addCampaignPlacementIds('testid', campaign);
                        chai_1.assert.deepEqual(placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType), { 'testid': campaign });
                    });
                });
                describe('getPlacementCampaignMap', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var campaign1 = TestFixtures_1.TestFixtures.getPromoCampaign();
                    var campaign2 = TestFixtures_1.TestFixtures.getXPromoCampaign();
                    sinon.stub(campaign1, 'getAdType').returns('purchasing/iap');
                    sinon.stub(campaign2, 'getAdType').returns('xpromo/video');
                    it('should return map of only placements specified by the content type of the campaign in the placement campaign map', function () {
                        var map = placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType);
                        chai_1.expect(Object.keys(map)).to.have.length(0);
                        placementManager.addCampaignPlacementIds('testid', campaign1);
                        placementManager.addCampaignPlacementIds('testid2', campaign2);
                        map = placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType);
                        chai_1.expect(Object.keys(map)).to.have.length(1);
                        chai_1.assert.deepEqual(placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType), {
                            'testid': campaign1
                        });
                    });
                });
                describe('clear', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                    sinon.stub(campaign, 'getAdType').returns('purchasing/iap');
                    it('should empty all placement IDs', function () {
                        placementManager.addCampaignPlacementIds('testid', campaign);
                        chai_1.assert.equal(Object.keys(placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType)).length, 1);
                        placementManager.clear();
                        chai_1.assert.equal(Object.keys(placementManager.getPlacementCampaignMap(PromoCampaignParser_1.PromoCampaignParser.ContentType)).length, 0);
                    });
                });
                describe('setPlacementReady', function () {
                    var campaign;
                    var sandbox;
                    var placementManager;
                    beforeEach(function () {
                        nativeBridge = TestFixtures_1.TestFixtures.getNativeBridge();
                        campaign = TestFixtures_1.TestFixtures.getPromoCampaign();
                        sandbox = sinon.sandbox.create();
                    });
                    afterEach(function () {
                        sandbox.restore();
                    });
                    it('should set placement state of the passed placementId', function () {
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                        chai_1.assert.equal(configuration.getPlacement('promoPlacement').getState(), Placement_2.PlacementState.NOT_AVAILABLE);
                        placementManager.setPlacementReady('promoPlacement', campaign);
                        chai_1.assert.equal(configuration.getPlacement('promoPlacement').getState(), Placement_2.PlacementState.READY);
                    });
                    it('should set the campaign of the placement to passed campaign', function () {
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                        chai_1.assert.equal(configuration.getPlacement('promoPlacement').getCurrentCampaign(), undefined);
                        placementManager.setPlacementReady('promoPlacement', campaign);
                        chai_1.assert.equal(configuration.getPlacement('promoPlacement').getCurrentCampaign(), campaign);
                    });
                    it('should not change placement state to ready if placement doesnt exist in config', function () {
                        configuration = ConfigurationParser_1.ConfigurationParser.parse(JSON.parse(ConfigurationPromoPlacements_json_1.default));
                        placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                        sandbox.stub(configuration, 'getPlacement').returns(undefined);
                        sandbox.stub(placementManager, 'setPlacementState');
                        placementManager.setPlacementReady('promoPlacement', campaign);
                        sinon.assert.notCalled(placementManager.setPlacementState);
                    });
                });
                it('should get and set campaign for known placement', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var testCampaign = TestFixtures_1.TestFixtures.getCampaign();
                    chai_1.assert.isUndefined(placementManager.getCampaign('video'), 'uninitialized video campaign was not undefined');
                    placementManager.setCampaign('video', testCampaign);
                    chai_1.assert.isDefined(placementManager.getCampaign('video'), 'campaign for placement was not successfully set');
                    chai_1.assert.equal(placementManager.getCampaign('video').getId(), testCampaign.getId(), 'campaign ids do not match');
                });
                it('should not get or set campaign for unknown placement', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var testCampaign = TestFixtures_1.TestFixtures.getCampaign();
                    chai_1.assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement did not return undefined campaign');
                    placementManager.setCampaign('unknown', testCampaign);
                    chai_1.assert.isUndefined(placementManager.getCampaign('unknown'), 'unknown placement returns a campaign after setCampaign invocation');
                });
                it('should clear campaigns', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    var testCampaign = TestFixtures_1.TestFixtures.getCampaign();
                    placementManager.setCampaign('premium', testCampaign);
                    placementManager.setCampaign('video', testCampaign);
                    chai_1.assert.isDefined(placementManager.getCampaign('premium'), 'test campaign was not properly set to premium placement');
                    chai_1.assert.isDefined(placementManager.getCampaign('video'), 'test campaign was not properly set to video placement');
                    placementManager.clearCampaigns();
                    chai_1.assert.isUndefined(placementManager.getCampaign('premium'), 'premium placement was not cleared');
                    chai_1.assert.isUndefined(placementManager.getCampaign('video'), 'video placement was not cleared');
                });
                it('should set waiting placement state for freshly initialized SDK', function () {
                    nativeBridge.Placement = new Placement_1.PlacementApi(nativeBridge);
                    nativeBridge.Listener = new Listener_1.ListenerApi(nativeBridge);
                    var placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
                    var listenerSpy = sinon.spy(nativeBridge.Listener, 'sendPlacementStateChangedEvent');
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    placementManager.setPlacementState('video', Placement_2.PlacementState.WAITING);
                    chai_1.assert.isTrue(placementSpy.calledOnceWithExactly('video', Placement_2.PlacementState.WAITING), 'placement state waiting was not set');
                    chai_1.assert.isTrue(listenerSpy.calledOnceWithExactly('video', Placement_2.PlacementState[Placement_2.PlacementState.NOT_AVAILABLE], Placement_2.PlacementState[Placement_2.PlacementState.WAITING]), 'placement state change event was not sent');
                });
                it('should set ready placement state for waiting placement', function () {
                    nativeBridge.Placement = new Placement_1.PlacementApi(nativeBridge);
                    nativeBridge.Listener = new Listener_1.ListenerApi(nativeBridge);
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    placementManager.setPlacementState('video', Placement_2.PlacementState.WAITING);
                    var placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
                    var listenerSpy = sinon.spy(nativeBridge.Listener, 'sendReadyEvent');
                    placementManager.setPlacementState('video', Placement_2.PlacementState.READY);
                    chai_1.assert.isTrue(placementSpy.calledOnceWithExactly('video', Placement_2.PlacementState.READY), 'placement state readt was not set');
                    chai_1.assert.isTrue(listenerSpy.calledOnceWithExactly('video'), 'ready event was not sent');
                });
                it('should not send events when placement state does not change', function () {
                    nativeBridge.Placement = new Placement_1.PlacementApi(nativeBridge);
                    nativeBridge.Listener = new Listener_1.ListenerApi(nativeBridge);
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    placementManager.setPlacementState('video', Placement_2.PlacementState.WAITING);
                    var placementSpy = sinon.spy(nativeBridge.Placement, 'setPlacementState');
                    var listenerSpy = sinon.spy(nativeBridge.Listener, 'sendPlacementStateChangedEvent');
                    placementManager.setPlacementState('video', Placement_2.PlacementState.WAITING);
                    chai_1.assert.isFalse(placementSpy.called, 'placement state was set to native side when placement state did not change');
                    chai_1.assert.isFalse(listenerSpy.called, 'placement state change event was sent when placement state did not change');
                });
                it('should set all placements to no fill state', function () {
                    var placementManager = new PlacementManager_1.PlacementManager(nativeBridge, configuration);
                    placementManager.setPlacementState('premium', Placement_2.PlacementState.WAITING);
                    placementManager.setPlacementState('video', Placement_2.PlacementState.WAITING);
                    placementManager.setAllPlacementStates(Placement_2.PlacementState.NO_FILL);
                    chai_1.assert.equal(configuration.getPlacement('premium').getState(), Placement_2.PlacementState.NO_FILL, 'premium placement was not set to no fill');
                    chai_1.assert.equal(configuration.getPlacement('video').getState(), Placement_2.PlacementState.NO_FILL, 'video placement was not set to no fill');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50TWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJQbGFjZW1lbnRNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBaUJBLFFBQVEsQ0FBQyxzQkFBc0IsRUFBRTtnQkFDN0IsSUFBSSxZQUEwQixDQUFDO2dCQUMvQixJQUFJLGFBQTRCLENBQUM7Z0JBRWpDLFVBQVUsQ0FBQztvQkFDUCxZQUFZLEdBQUcsMkJBQVksQ0FBQyxlQUFlLEVBQUUsQ0FBQztvQkFDOUMsYUFBYSxHQUFHLDJCQUFZLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDcEQsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLHlCQUF5QixFQUFFO29CQUNoQyxJQUFNLGdCQUFnQixHQUFHLElBQUksbUNBQWdCLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxDQUFDO29CQUMzRSxJQUFNLFFBQVEsR0FBa0IsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNoRSxLQUFLLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztvQkFFNUQsRUFBRSxDQUFDLHdFQUF3RSxFQUFFO3dCQUN6RSxnQkFBZ0IsQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsUUFBUSxDQUFDLENBQUM7d0JBQzdELGFBQU0sQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsdUJBQXVCLENBQUMseUNBQW1CLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBQyxRQUFRLEVBQUUsUUFBUSxFQUFDLENBQUMsQ0FBQztvQkFDdEgsQ0FBQyxDQUFDLENBQUM7Z0JBQ1AsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsUUFBUSxDQUFDLHlCQUF5QixFQUFFO29CQUNoQyxJQUFNLGdCQUFnQixHQUFHLElBQUksbUNBQWdCLENBQUMsWUFB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