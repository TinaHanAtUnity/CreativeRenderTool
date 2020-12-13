import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { RequestManager } from 'Core/Managers/RequestManager';
import { SdkApi } from 'Core/Native/Sdk';
import ProgrammaticVastCampaignIAS from 'json/campaigns/vast/ProgrammaticVastCampaignIAS.json';
import ProgrammaticVastCampaignFlat from 'json/campaigns/vast/ProgrammaticVastCampaignFlat.json';
import ProgrammaticVastCampaignWithEncodedUrl from 'json/campaigns/vast/ProgrammaticVastCampaignWithEncodedUrl.json';
import ProgrammaticVastCampaignWithVpaidAd from 'json/campaigns/vast/ProgrammaticVastCampaignWithVpaidAd.json';
import VastCompanionAdXml from 'xml/VastCompanionAd.xml';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser } from 'VAST/Parsers/ProgrammaticVastParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastParserStrict } from 'VAST/Utilities/VastParserStrict';
import VastWrappedIAS from 'xml/WrappedVastIAS.xml';
import ProgrammaticVastCampaignIASMid from 'json/campaigns/vast/ProgrammaticVastCampaignIASMid.json';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
describe('ProgrammaticVastParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const impressionUrl = 'http://sdk.unityads.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.vastparser.com&C8=vastparser.com&C9=http%3A%2F%2Fwww.programmaticvast.com&C10=xn&rn=-103217130';
    let parser;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let request;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        core.Api.Sdk = sinon.createStubInstance(SdkApi);
        request = sinon.createStubInstance(RequestManager);
        core.RequestManager = request;
        session = TestFixtures.getSession();
        parser = new ProgrammaticVastParser(core);
        ProgrammaticVastParser.setVastParserMaxDepth(8);
        sinon.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
    });
    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            beforeEach(() => {
                return parse(ProgrammaticVastCampaignFlat);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VastCampaign, 'Campaign was not an VastCampaign');
                const vastParser = new VastParserStrict();
                const json = ProgrammaticVastCampaignFlat;
                const vast = vastParser.parseVast(decodeURIComponent(json.content));
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getVideo().getUrl(), vast.getVideoUrl(), 'Video URL is not the same');
                assert.equal(campaign.getVideo().getWidth(), 600, 'Video width does not match');
                assert.equal(campaign.getVideo().getHeight(), 396, 'Video height does not match');
                assert.deepEqual(campaign.getImpressionUrls(), [impressionUrl], 'Impression URL are not the same');
            });
        });
        describe('with a VPAID ad inside a VAST ad', () => {
            it('should throw ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD error', () => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], ProgrammaticVastCampaignWithVpaidAd, mediaId, correlationId);
                return parser.parse(response, session).then(() => {
                    assert.fail('An error should have been thrown');
                }).catch((error) => {
                    if (error.contentType === CampaignContentTypes.ProgrammaticVast && error.errorCode === ProgrammaticVastParser.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD) {
                        // then the test has passed
                    }
                    else {
                        assert.fail(`Expected MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD error but got ${error.message}`);
                    }
                });
            });
        });
        describe('with encoded urls in vast ad', () => {
            it('should have valid data', () => {
                const getStub = request.get;
                getStub.returns(Promise.resolve({
                    response: VastCompanionAdXml
                }));
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], ProgrammaticVastCampaignWithEncodedUrl, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    const vastCampaign = parsedCampaign;
                    assert.isNotNull(vastCampaign);
                    // no errors is passing
                });
            });
        });
        describe('with a nested IAS tag at the top-level VAST', () => {
            it('should be a publica VAST', () => {
                const getStub = request.get;
                getStub.returns(Promise.resolve({
                    response: VastCompanionAdXml
                }));
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], ProgrammaticVastCampaignIAS, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    const vastCampaign = parsedCampaign;
                    assert.isNotNull(vastCampaign);
                    assert.equal(vastCampaign.getVast().isPublicaTag(), true);
                });
            });
        });
        describe('with a nested IAS tag at the second-level VAST', () => {
            it('should be a publica VAST', () => {
                const getStub = request.get;
                // IAS Vast returned after first wrapper call
                getStub.onCall(0).returns(Promise.resolve({
                    response: VastWrappedIAS
                }));
                // non-IAS Vast returned after second wrapper call
                getStub.onCall(1).returns(Promise.resolve({
                    response: VastCompanionAdXml
                }));
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                // ProgrammaticVastCampaignIASMid - contains a non-ias wrapper tag
                const response = new AuctionResponse([auctionPlacement], ProgrammaticVastCampaignIASMid, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    const vastCampaign = parsedCampaign;
                    assert.isNotNull(vastCampaign);
                    // maintains publica status
                    assert.equal(vastCampaign.getVast().isPublicaTag(), true);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVmFzdFBhcnNlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi90ZXN0L1VuaXQvVkFTVC9Qcm9ncmFtbWF0aWNWYXN0UGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFHL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRzlELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLDJCQUEyQixNQUFNLHNEQUFzRCxDQUFDO0FBQy9GLE9BQU8sNEJBQTRCLE1BQU0sdURBQXVELENBQUM7QUFDakcsT0FBTyxzQ0FBc0MsTUFBTSxpRUFBaUUsQ0FBQztBQUNySCxPQUFPLG1DQUFtQyxNQUFNLDhEQUE4RCxDQUFDO0FBQy9HLE9BQU8sa0JBQWtCLE1BQU0seUJBQXlCLENBQUM7QUFDekQsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzdFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sY0FBYyxNQUFNLHdCQUF3QixD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