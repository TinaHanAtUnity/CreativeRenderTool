import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages, PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { Image } from 'Ads/Models/Assets/Image';

describe('CampaignAssetInfoTest', () => {
    const campaign = new PerformanceCampaignWithImages(new PerformanceCampaign());
    const core = new Core().Api;

    let orientedImage: Image;
    let orientedImageUrl: string;
    beforeEach(async () => {
        orientedImage = await CampaignAssetInfo.getOrientedImage(campaign, core.DeviceInfo);
        orientedImageUrl = orientedImage.getUrl();
    });

    it('should return an image when provided with a valid campaign', () => {
        expect(orientedImage).toBeInstanceOf(Image);
    });

    it('should return the image url', () => {
        const expectedUrl = 'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png';
        expect(orientedImageUrl).toEqual(expectedUrl);
    });
});
