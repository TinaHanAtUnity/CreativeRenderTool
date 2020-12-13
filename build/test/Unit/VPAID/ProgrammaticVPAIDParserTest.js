import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { SdkApi } from 'Core/Native/Sdk';
import ProgrammaticVPAIDCampaign from 'json/campaigns/vpaid/ProgrammaticVPAIDCampaign.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { ProgrammaticVPAIDParser } from 'VPAID/Parsers/ProgrammaticVPAIDParser';
describe('ProgrammaticVPAIDParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    let parser;
    let platform;
    let backend;
    let nativeBridge;
    let core;
    let session;
    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        core.Api.Sdk = sinon.createStubInstance(SdkApi);
        session = TestFixtures.getSession();
        parser = new ProgrammaticVPAIDParser(core);
    });
    describe('parsing a campaign', () => {
        describe('with proper XML payload', () => {
            let campaign;
            const parse = (data) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            };
            beforeEach(() => {
                return parse(ProgrammaticVPAIDCampaign);
            });
            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VPAIDCampaign, 'Campaign was not an VPAIDCampaign');
                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not equal');
                assert.equal(campaign.getVPAID().getScriptUrl(), 'https://fake-ads-backend.unityads.unity3d.com/get_file/js/vpaid_sample.js', 'Script URL is not equal');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJvZ3JhbW1hdGljVlBBSURQYXJzZXJUZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZQQUlEL1Byb2dyYW1tYXRpY1ZQQUlEUGFyc2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDN0QsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFHL0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUM5QixPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFJbkQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRXpDLE9BQU8seUJBQXlCLE1BQU0scURBQXFELENBQUM7QUFDNUYsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxNQUFNLHVDQUF1QyxDQUFDO0FBRWhGLFFBQVEsQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7SUFDckMsTUFBTSxXQUFXLEdBQUcsZUFBZSxDQUFDO0lBQ3BDLE1BQU0sT0FBTyxHQUFHLHdCQUF3QixDQUFDO0lBQ3pDLE1BQU0sYUFBYSxHQUFHLDBCQUEwQixDQUFDO0lBRWpELElBQUksTUFBK0IsQ0FBQztJQUNwQyxJQUFJLFFBQWtCLENBQUM7SUFDdkIsSUFBSSxPQUFnQixDQUFDO0lBQ3JCLElBQUksWUFBMEIsQ0FBQztJQUMvQixJQUFJLElBQVcsQ0FBQztJQUNoQixJQUFJLE9BQWdCLENBQUM7SUFFckIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMvRCxJQUFJLEdBQUcsWUFBWSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsR0FBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFdkQsT0FBTyxHQUFHLFlBQVksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUVwQyxNQUFNLEdBQUcsSUFBSSx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQyxDQUFDLENBQUMsQ0FBQztJQUVILFFBQVEsQ0FBQyxvQkFBb0IsRUFBRSxHQUFHLEVBQUU7UUFDaEMsUUFBUSxDQUFDLHlCQUF5QixFQUFFLEdBQUcsRUFBRTtZQUNyQyxJQUFJLFFBQXVCLENBQUM7WUFDNUIsTUFBTSxLQUFLLEdBQUcsQ0FBQyxJQUFTLEVBQUUsRUFBRTtnQkFDeEIsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztnQkFDcEUsTUFBTSxRQUFRLEdBQUcsSUFBSSxlQUFlLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUM7Z0JBQ3ZGLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsY0FBYyxFQUFFLEVBQUU7b0JBQzNELFFBQVEsR0FBa0IsY0FBYyxDQUFDO2dCQUM3QyxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQztZQUVGLFVBQVUsQ0FBQyxHQUFHLEVBQUU7Z0JBQ1osT0FBTyxLQUFLLENBQUMseUJBQXlCLENBQUMsQ0FBQztZQUM1QyxDQUFDLENBQUMsQ0FBQztZQUVILEVBQUUsQ0FBQyx3QkFBd0IsRUFBRSxHQUFHLEVBQUU7Z0JBQzlCLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7Z0JBQy9DLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxZQUFZLGFBQWEsRUFBRSxtQ0FBbUMsQ0FBQyxDQUFDO2dCQUV0RixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxVQUFVLEVBQUUsRUFBRSxPQUFPLEVBQUUsc0JBQXNCLENBQUMsQ0FBQztnQkFDckUsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsVUFBVSxFQUFFLEVBQUUsT0FBTyxFQUFFLHNCQUFzQixDQUFDLENBQUM7Z0JBQ3JFLE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLFlBQVksRUFBRSxFQUFFLDJFQUEyRSxFQUFFLHlCQUF5QixDQUFDLENBQUM7WUFDN0osQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==