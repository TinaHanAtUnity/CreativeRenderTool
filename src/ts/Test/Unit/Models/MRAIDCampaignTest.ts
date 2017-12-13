import 'mocha';
import { assert } from 'chai';

import { MRAIDCampaign } from 'Models/Campaigns/MRAIDCampaign';
import { HTML } from 'Models/Assets/HTML';
import { Configuration } from 'Models/Configuration';
import ConfigurationAuctionPlc from 'json/ConfigurationAuctionPlc.json';
import OnProgrammaticMraidUrlPlcCampaign from 'json/OnProgrammaticMraidUrlPlcCampaign.json';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('MRAIDCampaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            const configurationJson = JSON.parse(ConfigurationAuctionPlc);
            const configuration = new Configuration(configurationJson);
            const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            const asset = new HTML(mraidJson.inlinedUrl, TestFixtures.getSession());
            mraidJson.id = 'testId';
            const campaign = new MRAIDCampaign(mraidJson, TestFixtures.getSession(), configuration.getGamerId(), configuration.getAbGroup(), json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL, mraidJson.inlinedUrl, '<div>resource</div>', undefined);

            assert.equal(campaign.getId(), mraidJson.id);
            assert.equal(campaign.getAbGroup(), configuration.getAbGroup());
            assert.equal(campaign.getGamerId(), configuration.getGamerId());
            assert.deepEqual(campaign.getResourceUrl(), asset);
            assert.deepEqual(campaign.getRequiredAssets(), [asset]);
            assert.deepEqual(campaign.getOptionalAssets(), []);
            assert.equal(campaign.getResource(), '<div>resource</div>');
            assert.equal(campaign.getDynamicMarkup(), mraidJson.dynamicMarkup);
            const willExpireAt = campaign.getWillExpireAt();
            assert.isDefined(willExpireAt, 'Will expire at should be defined');
            if(willExpireAt) {
                const timeDiff = willExpireAt - (Date.now() + json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL * 1000);
                assert.isTrue(Math.abs(timeDiff) < 50, 'Expected difference of willExpireAt and calculated willExpireAt to be less than 50ms');
            }
        });

        it('should have correct additional tracking from the json', () => {
            const configurationJson = JSON.parse(ConfigurationAuctionPlc);
            const configuration = new Configuration(configurationJson);
            const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            mraidJson.id = 'testId';
            const campaign = new MRAIDCampaign(mraidJson, TestFixtures.getSession(), configuration.getGamerId(), configuration.getAbGroup(), json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].cacheTTL, mraidJson.inlinedUrl, '<div>resource</div>', json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].trackingUrls);

            assert.deepEqual(campaign.getTrackingEventUrls(), json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].trackingUrls);
        });

        it('should set resourceUrl', () => {
            const configurationJson = JSON.parse(ConfigurationAuctionPlc);
            const configuration = new Configuration(configurationJson);
            const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            mraidJson.id = 'testId';
            const campaign = new MRAIDCampaign(mraidJson, TestFixtures.getSession(), configuration.getGamerId(), configuration.getAbGroup(), 12345);
            const asset = new HTML('https://resource-url.com', TestFixtures.getSession());

            campaign.setResourceUrl('https://resource-url.com');

            assert.deepEqual(campaign.getResourceUrl(), asset);
        });

        it('should set resource', () => {
            const configurationJson = JSON.parse(ConfigurationAuctionPlc);
            const configuration = new Configuration(configurationJson);
            const json = JSON.parse(OnProgrammaticMraidUrlPlcCampaign);
            const mraidJson = JSON.parse(json.media['UX-47c9ac4c-39c5-4e0e-685e-52d4619dcb85'].content);
            mraidJson.id = 'testId';
            const campaign = new MRAIDCampaign(mraidJson, TestFixtures.getSession(), configuration.getGamerId(), configuration.getAbGroup(), 12345);

            campaign.setResource('some resource');

            assert.equal(campaign.getResource(), 'some resource');
        });
    });
});
