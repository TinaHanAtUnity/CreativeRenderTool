System.register(["mocha", "sinon", "chai", "Native/NativeBridge", "Models/Campaigns/MRAIDCampaign", "Models/Placement", "Views/MRAID", "../TestHelpers/TestFixtures", "Views/GDPRPrivacy", "html/mraid/container.html", "json/OnProgrammaticMraidUrlPlcCampaign.json", "Managers/GdprManager"], function (exports_1, context_1) {
    "use strict";
    var sinon, chai_1, NativeBridge_1, MRAIDCampaign_1, Placement_1, MRAID_1, TestFixtures_1, GDPRPrivacy_1, container_html_1, OnProgrammaticMraidUrlPlcCampaign_json_1, GdprManager_1;
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
            function (MRAIDCampaign_1_1) {
                MRAIDCampaign_1 = MRAIDCampaign_1_1;
            },
            function (Placement_1_1) {
                Placement_1 = Placement_1_1;
            },
            function (MRAID_1_1) {
                MRAID_1 = MRAID_1_1;
            },
            function (TestFixtures_1_1) {
                TestFixtures_1 = TestFixtures_1_1;
            },
            function (GDPRPrivacy_1_1) {
                GDPRPrivacy_1 = GDPRPrivacy_1_1;
            },
            function (container_html_1_1) {
                container_html_1 = container_html_1_1;
            },
            function (OnProgrammaticMraidUrlPlcCampaign_json_1_1) {
                OnProgrammaticMraidUrlPlcCampaign_json_1 = OnProgrammaticMraidUrlPlcCampaign_json_1_1;
            },
            function (GdprManager_1_1) {
                GdprManager_1 = GdprManager_1_1;
            }
        ],
        execute: function () {
            describe('MRAID', function () {
                var handleInvocation;
                var handleCallback;
                var nativeBridge;
                var placement;
                var configuration;
                var privacy;
                var gdprManager;
                beforeEach(function () {
                    handleInvocation = sinon.spy();
                    handleCallback = sinon.spy();
                    nativeBridge = new NativeBridge_1.NativeBridge({
                        handleInvocation: handleInvocation,
                        handleCallback: handleCallback
                    });
                    placement = new Placement_1.Placement({
                        id: '123',
                        name: 'test',
                        default: true,
                        allowSkip: true,
                        skipInSeconds: 5,
                        disableBackButton: true,
                        useDeviceOrientationForVideo: false,
                        muteVideo: false
                    });
                    configuration = TestFixtures_1.TestFixtures.getConfiguration();
                    gdprManager = sinon.createStubInstance(GdprManager_1.GdprManager);
                    privacy = new GDPRPrivacy_1.GDPRPrivacy(nativeBridge, gdprManager, true, true);
                });
                it('should render', function (done) {
                    var campaign = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaign();
                    var mraid = new MRAID_1.MRAID(nativeBridge, placement, campaign, privacy, false);
                    mraid.render();
                    setTimeout(function () {
                        var container = mraid.container();
                        chai_1.assert.isNotNull(container.innerHTML);
                        chai_1.assert.isNotNull(container.querySelector('.close-region'));
                        chai_1.assert.isNotNull(container.querySelector('.close'));
                        chai_1.assert.isNotNull(container.querySelector('.icon-close'));
                        chai_1.assert.isNotNull(container.querySelector('.progress-wrapper'));
                        chai_1.assert.isNotNull(container.querySelector('.circle-left'));
                        chai_1.assert.isNotNull(container.querySelector('.circle-right'));
                        chai_1.assert.isNotNull(container.querySelector('#mraid-iframe'));
                        chai_1.assert.equal(mraid.container().innerHTML.indexOf('mraid.js'), -1);
                        done();
                    }, 0);
                });
                it('should replace placeholder with dynamic markup injected', function () {
                    var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                    var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
                    params.resourceAsset = undefined;
                    params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><div>Hello</div>';
                    params.dynamicMarkup = 'InjectMe';
                    var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                    var mraid = new MRAID_1.MRAID(nativeBridge, placement, campaign, privacy, false);
                    return mraid.createMRAID(container_html_1.default).then(function (mraidSrc) {
                        chai_1.assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
                    });
                });
                it('should remove the mraid.js placeholder when it has a query parameter', function () {
                    var markup = '<script src="mraid.js?foo=bar&baz=blah><div>Hello, world!</div>';
                    var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                    var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
                    params.resourceAsset = undefined;
                    params.resource = markup;
                    params.dynamicMarkup = 'InjectMe';
                    var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                    var mraid = new MRAID_1.MRAID(nativeBridge, placement, campaign, privacy, false);
                    return mraid.createMRAID(container_html_1.default).then(function (src) {
                        var dom = new DOMParser().parseFromString(src, 'text/html');
                        chai_1.assert.isNotNull(dom);
                        chai_1.assert.isNull(dom.querySelector('script[src^="mraid.js"]'));
                    });
                });
                it('should not remove string replacement patterns', function () {
                    var json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign_json_1.default);
                    var params = TestFixtures_1.TestFixtures.getProgrammaticMRAIDCampaignParams(json, 3600, '123abc');
                    params.resourceAsset = undefined;
                    params.resource = '<script src="mraid.js"></script><script>{UNITY_DYNAMIC_MARKUP}</script><script>var test = "Hello $&"</script><div>Hello World</div>';
                    params.dynamicMarkup = 'InjectMe';
                    var campaign = new MRAIDCampaign_1.MRAIDCampaign(params);
                    var mraid = new MRAID_1.MRAID(nativeBridge, placement, campaign, privacy, false);
                    return mraid.createMRAID(container_html_1.default).then(function (mraidSrc) {
                        chai_1.assert.notEqual(mraidSrc.indexOf('InjectMe'), -1);
                        chai_1.assert.notEqual(mraidSrc.indexOf('<script>var test = "Hello $&"</script>'), -1);
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiTVJBSURUZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFpQkEsUUFBUSxDQUFDLE9BQU8sRUFBRTtnQkFDZCxJQUFJLGdCQUFnQyxDQUFDO2dCQUNyQyxJQUFJLGNBQThCLENBQUM7Z0JBQ25DLElBQUksWUFBMEIsQ0FBQztnQkFDL0IsSUFBSSxTQUFvQixDQUFDO2dCQUN6QixJQUFJLGFBQTRCLENBQUM7Z0JBQ2pDLElBQUksT0FBb0IsQ0FBQztnQkFDekIsSUFBSSxXQUF3QixDQUFDO2dCQUU3QixVQUFVLENBQUM7b0JBQ1AsZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUMvQixjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDO29CQUM3QixZQUFZLEdBQUcsSUFBSSwyQkFBWSxDQUFDO3dCQUM1QixnQkFBZ0Isa0JBQUE7d0JBQ2hCLGNBQWMsZ0JBQUE7cUJBQ2pCLENBQUMsQ0FBQztvQkFFSCxTQUFTLEdBQUcsSUFBSSxxQkFBUyxDQUFDO3dCQUN0QixFQUFFLEVBQUUsS0FBSzt3QkFDVCxJQUFJLEVBQUUsTUFBTTt3QkFDWixPQUFPLEVBQUUsSUFBSTt3QkFDYixTQUFTLEVBQUUsSUFBSTt3QkFDZixhQUFhLEVBQUUsQ0FBQzt3QkFDaEIsaUJBQWlCLEVBQUUsSUFBSTt3QkFDdkIsNEJBQTRCLEVBQUUsS0FBSzt3QkFDbkMsU0FBUyxFQUFFLEtBQUs7cUJBQ25CLENBQUMsQ0FBQztvQkFFSCxhQUFhLEdBQUcsMkJBQVksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO29CQUNoRCxXQUFXLEdBQUcsS0FBSyxDQUFDLGtCQUFrQixDQUFDLHlCQUFXLENBQUMsQ0FBQztvQkFDcEQsT0FBTyxHQUFHLElBQUkseUJBQVcsQ0FBQyxZQUFZLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDckUsQ0FBQyxDQUFDLENBQUM7Z0JBRUgsRUFBRSxDQUFDLGVBQWUsRUFBRSxVQUFDLElBQUk7b0JBQ3JCLElBQU0sUUFBUSxHQUFHLDJCQUFZLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztvQkFDN0QsSUFBTSxLQUFLLEdBQUcsSUFBSSxhQUFLLENBQUMsWUFBWSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO29CQUUzRSxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRWYsVUFBVSxDQUFDO3dCQUNQLElBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxTQUFTLEVBQUUsQ0FBQzt3QkFDcEMsYUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7d0JBQ3RDLGFBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUMzRCxhQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQzt3QkFDcEQsYUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUM7d0JBQ3pELGFBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUM7d0JBQy9ELGFBQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO3dCQUMxRCxhQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzt3QkFDM0QsYUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7d0JBQzNELGFBQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQzt3QkFFbEUsSUFBSSxFQUFFLENBQUM7b0JBQ1gsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNWLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyx5REFBeUQsRUFBRTtvQkFDMUQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnREFBaUMsQ0FBQyxDQUFDO29CQUMzRCxJQUFNLE1BQU0sR0FBRywyQkFBWSxDQUFDLGtDQUFrQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3JGLE1BQU0sQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUNqQyxNQUFNLENBQUMsUUFBUSxHQUFHLHlGQUF5RixDQUFDO29CQUM1RyxNQUFNLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztvQkFDbEMsSUFBTSxRQUFRLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUUzQyxJQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyx3QkFBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTt3QkFDbkQsYUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQyxzRUFBc0UsRUFBRTtvQkFDdkUsSUFBTSxNQUFNLEdBQUcsaUVBQWlFLENBQUM7b0JBQ2pGLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZ0RBQWlDLENBQUMsQ0FBQztvQkFDM0QsSUFBTSxNQUFNLEdBQUcsMkJBQVksQ0FBQyxrQ0FBa0MsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO29CQUNyRixNQUFNLENBQUMsYUFBYSxHQUFHLFNBQVMsQ0FBQztvQkFDakMsTUFBTSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUM7b0JBQ3pCLE1BQU0sQ0FBQyxhQUFhLEdBQUcsVUFBVSxDQUFDO29CQUNsQyxJQUFNLFFBQVEsR0FBRyxJQUFJLDZCQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzNDLElBQU0sS0FBSyxHQUFHLElBQUksYUFBSyxDQUFDLFlBQVksRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQztvQkFDM0UsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLHdCQUFjLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQyxHQUFHO3dCQUM5QyxJQUFNLEdBQUcsR0FBRyxJQUFJLFNBQVMsRUFBRSxDQUFDLGVBQWUsQ0FBQyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUM7d0JBQzlELGFBQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBQ3RCLGFBQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDLENBQUM7b0JBQ2hFLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO2dCQUVILEVBQUUsQ0FBQywrQ0FBK0MsRUFBRTtvQkFDaEQsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxnREFBaUMsQ0FBQyxDQUFDO29CQUMzRCxJQUFNLE1BQU0sR0FBRywyQkFBWSxDQUFDLGtDQUFrQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7b0JBQ3JGLE1BQU0sQ0FBQyxhQUFhLEdBQUcsU0FBUyxDQUFDO29CQUNqQyxNQUFNLENBQUMsUUFBUSxHQUFHLHFJQUFxSSxDQUFDO29CQUN4SixNQUFNLENBQUMsYUFBYSxHQUFHLFVBQVUsQ0FBQztvQkFDbEMsSUFBTSxRQUFRLEdBQUcsSUFBSSw2QkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMzQyxJQUFNLEtBQUssR0FBRyxJQUFJLGFBQUssQ0FBQyxZQUFZLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQzNFLE9BQU8sS0FBSyxDQUFDLFdBQVcsQ0FBQyx3QkFBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsUUFBUTt3QkFDbkQsYUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2xELGFBQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyx3Q0FBd0MsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3BGLENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==