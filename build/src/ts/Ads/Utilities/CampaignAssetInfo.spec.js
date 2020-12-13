import * as tslib_1 from "tslib";
import { CampaignAssetInfo } from 'Ads/Utilities/CampaignAssetInfo';
import { Core } from 'Core/__mocks__/Core';
import { PerformanceCampaignWithImages, PerformanceCampaign } from 'Performance/Models/__mocks__/PerformanceCampaign';
import { Image } from 'Ads/Models/Assets/Image';
describe('CampaignAssetInfoTest', () => {
    const core = new Core().Api;
    describe('When getOrientedImage succeeds', () => {
        const campaignWithImages = new PerformanceCampaignWithImages(new PerformanceCampaign());
        let orientedImage;
        let orientedImageUrl;
        beforeEach(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            orientedImage = yield CampaignAssetInfo.getOrientedImage(campaignWithImages, core.DeviceInfo);
            orientedImageUrl = orientedImage.getUrl();
        }));
        it('should return an image when provided with a valid campaign', () => {
            expect(orientedImage).toBeInstanceOf(Image);
        });
        it('should return the image url', () => {
            const expectedUrl = 'http://cdn-creatives-highwinds-prd.unityads.unity3d.com/assets/0fd53267-0620-4dce-b04f-dd70cecd4990/600x800.png';
            expect(orientedImageUrl).toEqual(expectedUrl);
        });
    });
    describe('When getOrientedImage errors', () => {
        const campaignWithoutImages = new PerformanceCampaign();
        it('should error when given a campaign with invalid images', () => {
            return expect(CampaignAssetInfo.getOrientedImage(campaignWithoutImages, core.DeviceInfo)).rejects.toThrowError('The image assets provided are invalid');
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2FtcGFpZ25Bc3NldEluZm8uc3BlYy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvVXRpbGl0aWVzL0NhbXBhaWduQXNzZXRJbmZvLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUMzQyxPQUFPLEVBQUUsNkJBQTZCLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxrREFBa0QsQ0FBQztBQUN0SCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFaEQsUUFBUSxDQUFDLHVCQUF1QixFQUFFLEdBQUcsRUFBRTtJQUNuQyxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQztJQUU1QixRQUFRLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO1FBQzVDLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSw2QkFBNkIsQ0FBQyxJQUFJLG1CQUFtQixFQUFFLENBQUMsQ0FBQztRQUV4RixJQUFJLGFBQW9CLENBQUM7UUFDekIsSUFBSSxnQkFBd0IsQ0FBQztRQUM3QixVQUFVLENBQUMsR0FBUyxFQUFFO1lBQ2xCLGFBQWEsR0FBRyxNQUFNLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLGtCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5RixnQkFBZ0IsR0FBRyxhQUFhLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDOUMsQ0FBQyxDQUFBLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw0REFBNEQsRUFBRSxHQUFHLEVBQUU7WUFDbEUsTUFBTSxDQUFDLGFBQWEsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxHQUFHLEVBQUU7WUFDbkMsTUFBTSxXQUFXLEdBQ2IsaUhBQWlILENBQUM7WUFFdEgsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2xELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQzFDLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxtQkFBbUIsRUFBRSxDQUFDO1FBRXhELEVBQUUsQ0FBQyx3REFBd0QsRUFBRSxHQUFHLEVBQUU7WUFDOUQsT0FBTyxNQUFNLENBQUMsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO1FBQzVKLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9