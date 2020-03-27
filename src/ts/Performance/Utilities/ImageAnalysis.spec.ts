import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Backend } from 'Backend/Backend';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { ICoreApi } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { Color } from 'Core/Utilities/Color';
import { ImageAnalysis } from 'Performance/Utilities/ImageAnalysis';
import { Image } from 'Ads/Models/Assets/Image';
import { assert } from 'chai';

describe('ImageAnalysisTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let campaign: PerformanceCampaign;

    describe('ImageAnalysis', () => {
        beforeEach(() => {
            platform = Platform.ANDROID;
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            campaign = TestFixtures.getCampaign();
        });

        describe('analyseImage', () => {
            it('should return the dominant color of the asset', () => {
                const items = [{
                    image: campaign.getPortrait(), expectedColor: new Color(0, 0, 0)
                }, {
                    image: campaign.getLandscape(), expectedColor: new Color(0, 0, 0)
                }];

                const analyseImage = (value: {image: Image | undefined; expectedColor: Color}) => {
                    return new Promise((resolve, reject) => {
                        ImageAnalysis.analyseImage(core, value.image!).then(swatches => {
                            if (!swatches || !swatches.length) {
                                reject('No swatches returned');
                            }
                            assert.deepEqual(swatches[0].color, value.expectedColor);
                            resolve();
                        });
                    });
                };

                return Promise.all(items.map(analyseImage));
            });
        });
    });
});
