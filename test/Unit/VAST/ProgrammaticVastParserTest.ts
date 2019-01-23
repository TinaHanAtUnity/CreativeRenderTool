import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';
import { Session } from 'Ads/Models/Session';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICore, ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { SdkApi } from 'Core/Native/Sdk';

import ProgrammaticVastCampaignFlat from 'json/campaigns/vast/ProgrammaticVastCampaignFlat.json';
import ProgrammaticVastCampaignWithVpaidAd from 'json/campaigns/vast/ProgrammaticVastCampaignWithVpaidAd.json';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastCampaign } from 'VAST/Models/VastCampaign';
import { ProgrammaticVastParser, ProgrammaticVastParserStrict } from 'VAST/Parsers/ProgrammaticVastParser';
import { VastParser } from 'VAST/Utilities/VastParser';
import { CampaignContentTypes } from 'Ads/Utilities/CampaignContentTypes';
import { VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

describe('ProgrammaticVastParser', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const impressionUrl = 'http://sdk.unityads.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.vastparser.com&C8=vastparser.com&C9=http%3A%2F%2Fwww.programmaticvast.com&C10=xn&rn=-103217130';

    let parser: ProgrammaticVastParser;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);

        core = TestFixtures.getCoreModule(nativeBridge);
        (<any>core.Api).Sdk = sinon.createStubInstance(SdkApi);
        session = TestFixtures.getSession();

        parser = new ProgrammaticVastParser(core);
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: VastCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <VastCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticVastCampaignFlat));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VastCampaign, 'Campaign was not an VastCampaign');

                const vastParser = new VastParser();
                const json = JSON.parse(ProgrammaticVastCampaignFlat);
                const vast = vastParser.parseVast(decodeURIComponent(json.content));

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getVideo().getUrl(), vast.getVideoUrl(), 'Video URL is not the same');
                assert.deepEqual(campaign.getImpressionUrls(), [impressionUrl], 'Impression URL are not the same');
            });
        });
    });
});

describe('ProgrammaticVastParserStrict', () => {
    const placementId = 'TestPlacement';
    const mediaId = 'o2YMT0Cmps6xHiOwNMeCrH';
    const correlationId = '583dfda0d933a3630a53249c';
    const impressionUrl = 'http://sdk.unityads.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http%3A%2F%2Fwww.vastparser.com&C8=vastparser.com&C9=http%3A%2F%2Fwww.programmaticvast.com&C10=xn&rn=-103217130';

    let parser: ProgrammaticVastParserStrict;
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICore;
    let request: RequestManager;
    let session: Session;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreModule(nativeBridge);
        (<any>core.Api.Sdk) = sinon.createStubInstance(SdkApi);

        request = sinon.createStubInstance(RequestManager);
        session = TestFixtures.getSession();

        parser = new ProgrammaticVastParserStrict(core);
        ProgrammaticVastParserStrict.setVastParserMaxDepth(8);
    });

    describe('parsing a campaign', () => {
        describe('with a proper JSON payload', () => {
            let campaign: VastCampaign;

            const parse = (data: any) => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], data, mediaId, correlationId);
                return parser.parse(response, session).then((parsedCampaign) => {
                    campaign = <VastCampaign>parsedCampaign;
                });
            };

            beforeEach(() => {
                return parse(JSON.parse(ProgrammaticVastCampaignFlat));
            });

            it('should have valid data', () => {
                assert.isNotNull(campaign, 'Campaign is null');
                assert.isTrue(campaign instanceof VastCampaign, 'Campaign was not an VastCampaign');

                const vastParser = new VastParser();
                const json = JSON.parse(ProgrammaticVastCampaignFlat);
                const vast = vastParser.parseVast(decodeURIComponent(json.content));

                assert.equal(campaign.getSession(), session, 'Session is not equal');
                assert.equal(campaign.getMediaId(), mediaId, 'MediaID is not the equal');
                assert.equal(campaign.getVideo().getUrl(), vast.getVideoUrl(), 'Video URL is not the same');
                assert.deepEqual(campaign.getImpressionUrls(), [impressionUrl], 'Impression URL are not the same');
            });
        });

        describe('with a VPAID ad inside a VAST ad', () => {
            it('should throw VastErrorCode.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD error', () => {
                const auctionPlacement = new AuctionPlacement(placementId, mediaId);
                const response = new AuctionResponse([auctionPlacement], JSON.parse(ProgrammaticVastCampaignWithVpaidAd), mediaId, correlationId);
                return parser.parse(response, session).then(() => {
                    assert.fail('An error should have been thrown');
                }).catch((error) => {
                    if (error.contentType === CampaignContentTypes.ProgrammaticVast && error.errorCode === VastErrorCode.MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD) {
                        // then the test has passed
                    } else {
                        assert.fail(`Expected MEDIA_FILE_GIVEN_VPAID_IN_VAST_AD error but got ${error.message}`);
                    }
                });
            });
        });

    });
});
