import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { NewVideoOverlay, IVideoOverlayParameters } from 'Ads/Views/NewVideoOverlay';
import { assert } from 'chai';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { GdprManager } from 'Ads/Managers/GdprManager';
import { Privacy } from 'Ads/Views/Privacy';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { Platform } from 'Core/Constants/Platform';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { Campaign } from 'Ads/Models/Campaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';

describe('VideoOverlayTest', () => {
    let handleInvocation: sinon.SinonSpy;
    let handleCallback: sinon.SinonSpy;
    let nativeBridge: NativeBridge;
    let privacy: AbstractPrivacy;
    let videoOverlayParameters: IVideoOverlayParameters<Campaign>;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;

    beforeEach(() => {
        handleInvocation = sinon.spy();
        handleCallback = sinon.spy();
        nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        privacy = new Privacy(nativeBridge, TestFixtures.getCampaign(), sinon.createStubInstance(GdprManager), false, false);
        deviceInfo = <DeviceInfo>{ getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false, getOsVersion: () => '8.0' };
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationJson));

        const campaign = TestFixtures.getCampaign();
        const placement = TestFixtures.getPlacement();

        videoOverlayParameters = {
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo
        };
    });

    it('should render', () => {
        const overlay = new NewVideoOverlay(nativeBridge, videoOverlayParameters, privacy, false);
        overlay.render();
        assert.isNotNull(overlay.container().innerHTML);
        assert.isNotNull(overlay.container().querySelector('.skip-button'));
        assert.isNotNull(overlay.container().querySelector('.buffering-spinner'));
        assert.isNotNull(overlay.container().querySelector('.mute-button'));
        assert.isNotNull(overlay.container().querySelector('.debug-message-text'));
        assert.isNotNull(overlay.container().querySelector('.call-button'));
        assert.isNotNull(overlay.container().querySelector('.timer-button'));
        assert.isNotNull(overlay.container().querySelector('.gdpr-button'));
        assert.isNotNull(overlay.container().querySelector('.gdpr-pop-up'));
    });

    it('should render with translations', () => {
        videoOverlayParameters.deviceInfo.getLanguage = () => 'fi';
        const overlay = new NewVideoOverlay(nativeBridge, videoOverlayParameters, privacy, false);
        overlay.render();
        const callToActionElement = overlay.container().querySelectorAll('.call-button .download-text')[0];
        assert.equal(callToActionElement.innerHTML, 'Asenna nyt');
    });

    it('should render PerformanceCampaign with install button', () => {
        const overlay = new NewVideoOverlay(nativeBridge, videoOverlayParameters, privacy, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.install-button'));
        assert.isNull(overlay.container().querySelector('.vast-button'));
    });

    it('should render VastCampaign with VAST call to action button', () => {
        videoOverlayParameters.campaign = TestFixtures.getCompanionVastCampaign();
        const overlay = new NewVideoOverlay(nativeBridge, videoOverlayParameters, privacy, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.vast-button'));
        assert.isNull(overlay.container().querySelector('.install-button'));
    });
});
