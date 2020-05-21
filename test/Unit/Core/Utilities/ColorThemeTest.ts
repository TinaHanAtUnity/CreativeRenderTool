import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { SDKMetrics } from 'Ads/Utilities/SDKMetrics';
import { ColorTheme } from 'Core/Utilities/ColorTheme';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';

describe('ColorThemeTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let sandbox: sinon.SinonSandbox;
    let campaign: PerformanceCampaign;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        campaign = TestFixtures.getCampaign();
        sandbox.stub(SDKMetrics, 'reportMetricEvent').returns(Promise.resolve());
        sandbox.stub(SDKMetrics, 'reportMetricEventWithTags').returns(Promise.resolve());
    });

    afterEach(() => {
        sandbox.restore();
    });

    const getColorTheme = async () => {
        return ColorTheme.renderColorTheme(campaign, core);
    };

    it('should successfully converts the 6 variants to their RGB values', async () => {
        await getColorTheme().then((theme) => {
            assert.equal(theme.baseColorTheme.light.toCssRgb(), 'rgb(215, 186, 247)');
            assert.equal(theme.baseColorTheme.medium.toCssRgb(), 'rgb(98, 21, 183)');
            assert.equal(theme.baseColorTheme.dark.toCssRgb(), 'rgb(61, 13, 114)');
            assert.equal(theme.secondaryColorTheme.light.toCssRgb(), 'rgb(206, 192, 242)');
            assert.equal(theme.secondaryColorTheme.medium.toCssRgb(), 'rgb(73, 36, 168)');
            assert.equal(theme.secondaryColorTheme.dark.toCssRgb(), 'rgb(45, 22, 105)');
        });
    });
});
