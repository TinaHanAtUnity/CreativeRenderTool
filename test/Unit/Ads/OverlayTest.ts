import { IAdsApi } from 'Ads/IAds';
import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { VideoOverlay, IVideoOverlayParameters } from 'Ads/Views/VideoOverlay';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { DeviceInfo } from 'Core/Models/DeviceInfo';
import { CoreConfigurationParser } from 'Core/Parsers/CoreConfigurationParser';
import ConfigurationJson from 'json/ConfigurationAuctionPlc.json';
import { Campaign, ICampaign } from 'Ads/Models/Campaign';
import { ClientInfo } from 'Core/Models/ClientInfo';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { PerformanceOverlayEventHandler } from 'Performance/EventHandlers/PerformanceOverlayEventHandler';
import { IARApi } from 'AR/AR';
import { IPurchasingApi } from 'Purchasing/IPurchasing';
import { ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import { RequestManager } from 'Core/Managers/RequestManager';
import { PerformanceAdUnit } from 'Performance/AdUnits/PerformanceAdUnit';

describe('VideoOverlayTest', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let ads: IAdsApi;
    let privacy: AbstractPrivacy;
    let videoOverlayParameters: IVideoOverlayParameters<Campaign>;
    let deviceInfo: DeviceInfo;
    let clientInfo: ClientInfo;
    let coreConfig: CoreConfiguration;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        ads = TestFixtures.getAdsApi(nativeBridge);

        privacy = new Privacy(platform, TestFixtures.getCampaign(), sinon.createStubInstance(UserPrivacyManager), false, false);
        deviceInfo = <DeviceInfo>{ getLanguage: () => 'en', getAdvertisingIdentifier: () => '000', getLimitAdTracking: () => false, getOsVersion: () => '8.0' };
        clientInfo = TestFixtures.getClientInfo(Platform.ANDROID);
        coreConfig = CoreConfigurationParser.parse(JSON.parse(ConfigurationJson));

        const campaign = TestFixtures.getCampaign();
        const placement = TestFixtures.getPlacement();

        videoOverlayParameters = {
            platform,
            ads,
            deviceInfo: deviceInfo,
            campaign: campaign,
            coreConfig: coreConfig,
            placement: placement,
            clientInfo: clientInfo
        };
    });

    it('should render', () => {
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
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
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        const callToActionElement = overlay.container().querySelectorAll('.call-button .download-text')[0];
        assert.equal(callToActionElement.innerHTML, 'Asenna nyt');
    });

    it('should render PerformanceCampaign with install button', () => {
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.install-button'));
        assert.isNull(overlay.container().querySelector('.vast-button'));
    });

    it('should render VastCampaign with VAST call to action button', () => {
        videoOverlayParameters.campaign = TestFixtures.getCompanionVastCampaign();
        const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
        overlay.render();
        assert.isNotNull(overlay.container().querySelector('.vast-button'));
        assert.isNull(overlay.container().querySelector('.install-button'));
    });

    describe('onCallButtonEvent', () => {
        let ar: IARApi;
        let purchasing: IPurchasingApi;
        let adUnit: PerformanceAdUnit;
        let thirdPartyEventManager: ThirdPartyEventManager;
        let wakeUpManager: WakeUpManager;
        let request: RequestManager;
        let perfOverlayHandler: PerformanceOverlayEventHandler;

        beforeEach(() => {
            ar = TestFixtures.getARApi(nativeBridge);
            purchasing = TestFixtures.getPurchasingApi(nativeBridge);
            adUnit = TestFixtures.getPerformanceAdUnit(platform, core, ads, ar, purchasing);
            wakeUpManager = new WakeUpManager(core);
            request = new RequestManager(platform, core, wakeUpManager);
            thirdPartyEventManager = new ThirdPartyEventManager(core, request);

            perfOverlayHandler = TestFixtures.getPerformanceOverlayEventHandler(platform, core, ads, ar, purchasing, videoOverlayParameters.campaign, adUnit, thirdPartyEventManager, nativeBridge);
            sinon.stub(perfOverlayHandler, 'onOverlayDownload');
        });

        xit('should call onOverlayDownload for performance campaign with correct parameters', () => {
            const standaloneCampaign = TestFixtures.getCampaignStandaloneAndroid();
            videoOverlayParameters.campaign = standaloneCampaign;
            const videoOverlayDownloadParameters = {
                clickAttributionUrl: standaloneCampaign.getClickAttributionUrl(),
                clickAttributionUrlFollowsRedirects: standaloneCampaign.getClickAttributionUrlFollowsRedirects(),
                bypassAppSheet: standaloneCampaign.getBypassAppSheet(),
                appStoreId: standaloneCampaign.getAppStoreId(),
                store: standaloneCampaign.getStore(),
                videoProgress: undefined,
                appDownloadUrl: standaloneCampaign.getAppDownloadUrl()
            };

            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            overlay.addEventHandler(perfOverlayHandler);
            overlay.render();
            const ctaButton = overlay.container().querySelector('.call-button');
            if (ctaButton) {
                ctaButton.dispatchEvent(new Event('click'));
            }

            sinon.assert.calledWith(<sinon.SinonSpy>perfOverlayHandler.onOverlayDownload, videoOverlayDownloadParameters);
        });

        xit('should call onOverlayDownload for xPromo campaign with correct parameters', () => {
            const xPromoCampaign = TestFixtures.getXPromoCampaign();
            videoOverlayParameters.campaign = xPromoCampaign;
            const videoOverlayDownloadParameters = {
                clickAttributionUrl: xPromoCampaign.getClickAttributionUrl(),
                clickAttributionUrlFollowsRedirects: xPromoCampaign.getClickAttributionUrlFollowsRedirects(),
                bypassAppSheet: xPromoCampaign.getBypassAppSheet(),
                appStoreId: xPromoCampaign.getAppStoreId(),
                store: xPromoCampaign.getStore(),
                videoProgress: undefined,
                appDownloadUrl: undefined
            };

            const overlay = new VideoOverlay(videoOverlayParameters, privacy, false, false);
            overlay.addEventHandler(perfOverlayHandler);
            overlay.render();
            const ctaButton = overlay.container().querySelector('.call-button');
            if (ctaButton) {
                ctaButton.dispatchEvent(new Event('click'));
            }

            sinon.assert.calledWith(<sinon.SinonSpy>perfOverlayHandler.onOverlayDownload, videoOverlayDownloadParameters);
        });
    });
});
