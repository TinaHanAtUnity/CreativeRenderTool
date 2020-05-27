import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { Image } from 'Ads/Models/Assets/Image';

describe('CampaignAssetInfoTest', () => {
    const campaign = new PerformanceCampaignWithImages();
    const core = new Core().Api;

    let orientedImage: Image;

    beforeEach(async () => {
        orientedImage = await CampaignAssetInfo.getOrientedImage(campaign, core.DeviceInfo);
    });

    it('should return an image when provided with a valid campaign', async () => {
        expect(orientedImage).toBeInstanceOf(Image);
    });
});
