System.register(["mocha", "chai", "Constants/Platform", "Models/ClientInfo"], function (exports_1, context_1) {
    "use strict";
    var chai_1, Platform_1, ClientInfo_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (Platform_1_1) {
                Platform_1 = Platform_1_1;
            },
            function (ClientInfo_1_1) {
                ClientInfo_1 = ClientInfo_1_1;
            }
        ],
        execute: function () {
            describe('ClientInfoTest', function () {
                var clientInfo;
                it('Get ClientInfo DTO', function () {
                    // gameId, testMode, applicationName, applicationVersion, sdkVersion, sdkVersionName
                    // debuggable, configUrl, webviewUrl, webviewHash, webviewVersion
                    var data = [
                        '11111',
                        true,
                        'com.unity3d.ads.test',
                        '1.0.0-test',
                        2000,
                        '2.0.0-sdk-test',
                        true,
                        'http://test.com/config.json',
                        'http://test.com/index.html',
                        '54321',
                        '2.0.0-webview-test',
                        0,
                        false,
                        { 'asd': 'asd' }
                    ];
                    clientInfo = new ClientInfo_1.ClientInfo(Platform_1.Platform.TEST, data);
                    var dto = clientInfo.getDTO();
                    chai_1.assert.equal(dto.gameId, '11111');
                    chai_1.assert.equal(dto.testMode, true);
                    chai_1.assert.equal(dto.bundleId, 'com.unity3d.ads.test');
                    chai_1.assert.equal(dto.bundleVersion, '1.0.0-test');
                    chai_1.assert.equal(dto.sdkVersion, '2000');
                    chai_1.assert.equal(dto.sdkVersionName, '2.0.0-sdk-test');
                    chai_1.assert.equal(dto.encrypted, false);
                    chai_1.assert.equal(dto.configUrl, 'http://test.com/config.json');
                    chai_1.assert.equal(dto.webviewUrl, 'http://test.com/index.html');
                    chai_1.assert.equal(dto.webviewHash, '54321');
                    chai_1.assert.equal(dto.webviewVersion, '2.0.0-webview-test');
                    chai_1.assert.equal(dto.platform, 'test');
                });
                it('Construct with invalid gameId', function () {
                    var data = [
                        'abc1111',
                        true,
                        'com.unity3d.ads.test',
                        '1.0.0-test',
                        2000,
                        '2.0.0-sdk-test',
                        true,
                        'http://test.com/config.json',
                        'http://test.com/index.html',
                        '54321',
                        '2.0.0-webview-test',
                        0,
                        false,
                        { 'asd': 'asd' }
                    ];
                    clientInfo = new ClientInfo_1.ClientInfo(Platform_1.Platform.TEST, data);
                    var dto = clientInfo.getDTO();
                    chai_1.assert.equal(dto.gameId, 'abc1111');
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xpZW50SW5mb1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJDbGllbnRJbmZvVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O1lBT0EsUUFBUSxDQUFDLGdCQUFnQixFQUFFO2dCQUV2QixJQUFJLFVBQXNCLENBQUM7Z0JBRTNCLEVBQUUsQ0FBQyxvQkFBb0IsRUFBRTtvQkFDckIsb0ZBQW9GO29CQUNwRixpRUFBaUU7b0JBQ2pFLElBQU0sSUFBSSxHQUFVO3dCQUNoQixPQUFPO3dCQUNQLElBQUk7d0JBQ0osc0JBQXNCO3dCQUN0QixZQUFZO3dCQUNaLElBQUk7d0JBQ0osZ0JBQWdCO3dCQUNoQixJQUFJO3dCQUNKLDZCQUE2Qjt3QkFDN0IsNEJBQTRCO3dCQUM1QixPQUFPO3dCQUNQLG9CQUFvQjt3QkFDcEIsQ0FBQzt3QkFDRCxLQUFLO3dCQUNMLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQztxQkFDakIsQ0FBQztvQkFFRixVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLG1CQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNqRCxJQUFNLEdBQUcsR0FBUSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRXJDLGFBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDbEMsYUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNqQyxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztvQkFDbkQsYUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFlBQVksQ0FBQyxDQUFDO29CQUM5QyxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3JDLGFBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLGNBQWMsRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO29CQUNuRCxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUM7b0JBQ25DLGFBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFNBQVMsRUFBRSw2QkFBNkIsQ0FBQyxDQUFDO29CQUMzRCxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsNEJBQTRCLENBQUMsQ0FBQztvQkFDM0QsYUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN2QyxhQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztvQkFDdkQsYUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUV2QyxDQUFDLENBQUMsQ0FBQztnQkFFSCxFQUFFLENBQUMsK0JBQStCLEVBQUU7b0JBQ2hDLElBQU0sSUFBSSxHQUFVO3dCQUNoQixTQUFTO3dCQUNULElBQUk7d0JBQ0osc0JBQXNCO3dCQUN0QixZQUFZO3dCQUNaLElBQUk7d0JBQ0osZ0JBQWdCO3dCQUNoQixJQUFJO3dCQUNKLDZCQUE2Qjt3QkFDN0IsNEJBQTRCO3dCQUM1QixPQUFPO3dCQUNQLG9CQUFvQjt3QkFDcEIsQ0FBQzt3QkFDRCxLQUFLO3dCQUNMLEVBQUMsS0FBSyxFQUFFLEtBQUssRUFBQztxQkFDakIsQ0FBQztvQkFFRixVQUFVLEdBQUcsSUFBSSx1QkFBVSxDQUFDLG1CQUFRLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUNqRCxJQUFNLEdBQUcsR0FBUSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUM7b0JBRXJDLGFBQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUMsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLENBQUM7WUFDUCxDQUFDLENBQUMsQ0FBQyJ9