import { Session, SessionMock } from 'Ads/Models/__mocks__/Session';
import { Platform } from 'Core/Constants/Platform';
import { ICore } from 'Core/ICore';
import { Core } from 'Core/__mocks__/Core';

// TODO: Fix imports in spec.ts files
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ValidAdMobCampaign = require('json/campaigns/admob/ValidAdMobCampaign.json');

import { AdMobCampaign } from 'AdMob/Models/AdMobCampaign';
import { ProgrammaticAdMobParser } from 'AdMob/Parsers/ProgrammaticAdMobParser';
import { AuctionResponse } from 'Ads/Models/AuctionResponse';
import { AuctionPlacement } from 'Ads/Models/AuctionPlacement';

[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('ProgrammaticAdMobParser', () => {

        let parser: ProgrammaticAdMobParser;
        let session: SessionMock;
        let core: ICore;
        let campaign: AdMobCampaign;

        describe('parsing a campaign', () => {

            beforeEach(() => {
                core = new Core();
                session = new Session();
                parser = new ProgrammaticAdMobParser(core);
                const auctionPlacement = new AuctionPlacement('placementId', 'mediaId');
                const auctionResponse = new AuctionResponse([auctionPlacement], ValidAdMobCampaign, 'mediaId', 'correlationId');
                return parser.parse(auctionResponse, session).then((parsedCampaign) => {
                    campaign = parsedCampaign;
                });
            });

            describe('with a proper JSON payload', () => {
                describe(`on ${Platform[platform]}`, () => {

                    it('should be a valid campaign', () => {
                        expect(campaign).toBeDefined();
                    });

                    it('should set the dynamic markup correctly', () => {
                        expect(campaign.getDynamicMarkup()).toEqual(ValidAdMobCampaign.content);
                    });

                    it('should set the session correctly', () => {
                        expect(campaign.getSession()).toStrictEqual(session);
                    });

                    it('should not have required assets', () => {
                        expect(campaign.getRequiredAssets()).toEqual([]);
                    });

                    it('should not have optional assets', () => {
                        expect(campaign.getRequiredAssets()).toEqual([]);
                    });
                });
            });
        });
    });
});
