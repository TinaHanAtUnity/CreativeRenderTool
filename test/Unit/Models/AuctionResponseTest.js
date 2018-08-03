System.register(["mocha", "chai", "Models/AuctionResponse", "json/OnProgrammaticMraidPlcCampaign.json"], function (exports_1, context_1) {
    "use strict";
    var chai_1, AuctionResponse_1, OnProgrammaticMraidPlcCampaign_json_1;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (_1) {
            },
            function (chai_1_1) {
                chai_1 = chai_1_1;
            },
            function (AuctionResponse_1_1) {
                AuctionResponse_1 = AuctionResponse_1_1;
            },
            function (OnProgrammaticMraidPlcCampaign_json_1_1) {
                OnProgrammaticMraidPlcCampaign_json_1 = OnProgrammaticMraidPlcCampaign_json_1_1;
            }
        ],
        execute: function () {
            describe('AuctionResponse', function () {
                describe('when created with response json', function () {
                    it('should have correct data from the json', function () {
                        var json = JSON.parse(OnProgrammaticMraidPlcCampaign_json_1.default);
                        var mediaId = 'UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85';
                        var campaignObject = json.media[mediaId];
                        var correlationId = json.correlationId;
                        var placements = [];
                        for (var placement in json.placements) {
                            if (json.placements.hasOwnProperty(placement)) {
                                placements.push(placement);
                            }
                        }
                        var auctionResponse = new AuctionResponse_1.AuctionResponse(placements, campaignObject, mediaId, correlationId);
                        chai_1.assert.equal(auctionResponse.getPlacements(), placements, 'Placements not what was expected');
                        chai_1.assert.equal(auctionResponse.getContentType(), campaignObject.contentType, 'ContentType not what was expected');
                        chai_1.assert.equal(auctionResponse.getContent(), campaignObject.content, 'Content not what was expected');
                        chai_1.assert.equal(auctionResponse.getCacheTTL(), campaignObject.cacheTTL, 'CacheTTL not what was expected');
                        chai_1.assert.deepEqual(auctionResponse.getTrackingUrls(), campaignObject.trackingUrls, 'TrackingUrls not what was expected');
                        chai_1.assert.equal(auctionResponse.getAdType(), campaignObject.adType, 'AdType not what was expected');
                        chai_1.assert.equal(auctionResponse.getCreativeId(), campaignObject.creativeId, 'CreativeId not what was expected');
                        chai_1.assert.equal(auctionResponse.getSeatId(), campaignObject.seatId, 'SeatId not what was expected');
                        chai_1.assert.equal(auctionResponse.getCategory(), campaignObject.appCategory, 'AppCategory not what was expected');
                        chai_1.assert.equal(auctionResponse.getSubCategory(), campaignObject.appSubCategory, 'AppSubCategory not what was expected');
                        chai_1.assert.equal(auctionResponse.getCorrelationId(), correlationId, 'CorrelationId not what was expected');
                        chai_1.assert.equal(auctionResponse.getUseWebViewUserAgentForTracking(), campaignObject.useWebViewUserAgentForTracking, 'UseWebViewUserAgentForTracking not what was expected');
                        chai_1.assert.equal(auctionResponse.isMoatEnabled(), campaignObject.isMoatEnabled, 'IsMoatEnabled not what was expected');
                    });
                });
            });
        }
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXVjdGlvblJlc3BvbnNlVGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkF1Y3Rpb25SZXNwb25zZVRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7OztZQU1BLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEIsUUFBUSxDQUFDLGlDQUFpQyxFQUFFO29CQUN4QyxFQUFFLENBQUMsd0NBQXdDLEVBQUU7d0JBQ3pDLElBQU0sSUFBSSxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsNkNBQThCLENBQUMsQ0FBQzt3QkFDN0QsSUFBTSxPQUFPLEdBQVcseUNBQXlDLENBQUM7d0JBQ2xFLElBQU0sY0FBYyxHQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7d0JBQ2hELElBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7d0JBQ3pDLElBQU0sVUFBVSxHQUFhLEVBQUUsQ0FBQzt3QkFFaEMsS0FBSSxJQUFNLFNBQVMsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFOzRCQUNwQyxJQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dDQUMxQyxVQUFVLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDOzZCQUM5Qjt5QkFDSjt3QkFFRCxJQUFNLGVBQWUsR0FBRyxJQUFJLGlDQUFlLENBQUMsVUFBVSxFQUFFLGNBQWMsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7d0JBQ2hHLGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGFBQWEsRUFBRSxFQUFFLFVBQVUsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO3dCQUM5RixhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxjQUFjLEVBQUUsRUFBRSxjQUFjLENBQUMsV0FBVyxFQUFFLG1DQUFtQyxDQUFDLENBQUM7d0JBQ2hILGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxFQUFFLGNBQWMsQ0FBQyxPQUFPLEVBQUUsK0JBQStCLENBQUMsQ0FBQzt3QkFDcEcsYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLEVBQUUsY0FBYyxDQUFDLFFBQVEsRUFBRSxnQ0FBZ0MsQ0FBQyxDQUFDO3dCQUN2RyxhQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxlQUFlLEVBQUUsRUFBRSxjQUFjLENBQUMsWUFBWSxFQUFFLG9DQUFvQyxDQUFDLENBQUM7d0JBQ3ZILGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFNBQVMsRUFBRSxFQUFFLGNBQWMsQ0FBQyxNQUFNLEVBQUUsOEJBQThCLENBQUMsQ0FBQzt3QkFDakcsYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxFQUFFLEVBQUUsY0FBYyxDQUFDLFVBQVUsRUFBRSxrQ0FBa0MsQ0FBQyxDQUFDO3dCQUM3RyxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxTQUFTLEVBQUUsRUFBRSxjQUFjLENBQUMsTUFBTSxFQUFFLDhCQUE4QixDQUFDLENBQUM7d0JBQ2pHLGFBQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxFQUFFLGNBQWMsQ0FBQyxXQUFXLEVBQUUsbUNBQW1DLENBQUMsQ0FBQzt3QkFDN0csYUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsY0FBYyxFQUFFLEVBQUUsY0FBYyxDQUFDLGNBQWMsRUFBRSxzQ0FBc0MsQ0FBQyxDQUFDO3dCQUN0SCxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxFQUFFLGFBQWEsRUFBRSxxQ0FBcUMsQ0FBQyxDQUFDO3dCQUN2RyxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxpQ0FBaUMsRUFBRSxFQUFFLGNBQWMsQ0FBQyw4QkFBOEIsRUFBRSxzREFBc0QsQ0FBQyxDQUFDO3dCQUN6SyxhQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLEVBQUUsRUFBRSxjQUFjLENBQUMsYUFBYSxFQUFFLHFDQUFxQyxDQUFDLENBQUM7b0JBQ3ZILENBQUMsQ0FBQyxDQUFDO2dCQUNQLENBQUMsQ0FBQyxDQUFDO1lBQ1AsQ0FBQyxDQUFDLENBQUMifQ==