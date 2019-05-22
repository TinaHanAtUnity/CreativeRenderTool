import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { VastCampaignErrorHandler, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
import { ICore } from 'Core/ICore';
import { Platform } from 'Core/Constants/Platform';
import { CampaignError, CampaignErrorLevel } from 'Ads/Errors/CampaignError';
import { RequestManager } from 'Core/Managers/RequestManager';
import { CampaignContentType } from 'Ads/Utilities/CampaignContentType';

describe('VastCampaignErrorHandlerTest', () => {
    const platform = Platform.ANDROID;
    const nativeBridge = TestFixtures.getNativeBridge(platform, TestFixtures.getBackend(platform));
    const coreModule: ICore = TestFixtures.getCoreModule(nativeBridge);
    const requestStub = sinon.createStubInstance(RequestManager);
    const vastCampaignErrorHandler = new VastCampaignErrorHandler(coreModule.Api, requestStub);

    describe('on handleCampaignError', () => {
        it('should fire correct VAST error tracking urls with macro replaced', () => {
            const errorUrl1 = 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=+Unknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper+3D+Gun+Shooter%3A+Free+Elite+Shooting+Games&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=[ERRORCODE]&asset_url=[ASSETURI]';
            const errorUrl2 = 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=%2BUnknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper%2B3D%2BGun%2BShooter%3A%2BFree%2BElite%2BShooting%2BGames&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=%5BERRORCODE%5D&asset_url=%5BASSETURI%5D';
            const errorUrl3 = 'https://vast-dsp.com/error?code=[errorcode]&code2=%5berrorcode%5d';

            const campaignError = new CampaignError('Undefined Error', CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.MEDIUM, VastErrorCode.UNKNOWN_ERROR, [errorUrl1, errorUrl2, errorUrl3], 'https://asset-url.com');

            vastCampaignErrorHandler.handleCampaignError(campaignError);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=+Unknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper+3D+Gun+Shooter%3A+Free+Elite+Shooting+Games&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=999&asset_url=https%3A%2F%2Fasset-url.com', []);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=%2BUnknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper%2B3D%2BGun%2BShooter%3A%2BFree%2BElite%2BShooting%2BGames&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=999&asset_url=https%3A%2F%2Fasset-url.com', []);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://vast-dsp.com/error?code=999&code2=999', []);
        });
    });

    describe('on handleCampaignError with multiple Errors compounded', () => {
        it('should fire correct VAST error tracking urls with macro replaced for compounded campaignErrors', () => {
            const errorUrl1 = 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=+Unknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper+3D+Gun+Shooter%3A+Free+Elite+Shooting+Games&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=[ERRORCODE]&asset_url=[ASSETURI]';
            const errorUrl2 = 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=%2BUnknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper%2B3D%2BGun%2BShooter%3A%2BFree%2BElite%2BShooting%2BGames&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=%5BERRORCODE%5D&asset_url=%5BASSETURI%5D';
            const errorUrl3 = 'https://vast-dsp.com/error?code=[errorcode]&code2=%5berrorcode%5d';

            const campaignError1 = new CampaignError('Undefined First Error', CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.MEDIUM, VastErrorCode.UNKNOWN_ERROR, [errorUrl1], 'https://asset-url.com');

            const campaignError2 = new CampaignError('Undefined Second Error', CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.MEDIUM, VastErrorCode.UNKNOWN_ERROR, [errorUrl2], 'https://asset-url.com');

            const campaignError3 = new CampaignError('Undefined Third Error', CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.LOW, VastErrorCode.UNKNOWN_ERROR, [errorUrl3], 'https://asset-url.com');

            const campaignErrorTotal = new CampaignError('Groupd of campaign errors', CampaignContentType.ProgrammaticVAST, CampaignErrorLevel.MEDIUM, VastErrorCode.XML_PARSER_ERROR, ['https://total-errors.com']);
            campaignErrorTotal.addSubCampaignError(campaignError1);
            campaignErrorTotal.addSubCampaignError(campaignError2);
            campaignErrorTotal.addSubCampaignError(campaignError3);

            vastCampaignErrorHandler.handleCampaignError(campaignErrorTotal);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://total-errors.com', []);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=+Unknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper+3D+Gun+Shooter%3A+Free+Elite+Shooting+Games&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=999&asset_url=https%3A%2F%2Fasset-url.com', []);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://adexp.liftoff.io/vast_errors?at=&exchange=36&ad-group-id=72959&creative-id=85151&auction-id=MOYDqfjkmTXTf5QzyavNU6-9078&device-id=913b9544-2290-421f-9b08-fc70dfc08984&device-id-sha1=a9fd1f69ecc2f2db026018591026a914a11adf48&device-id-type=2&device-family=4&device-model=%2BUnknown&os-version=9&source-app-store-id=com.fungames.sniper3d&targeted-city-id=&targeted-country-id=7&bid-ts=1557514952290&source-app-name=Sniper%2B3D%2BGun%2BShooter%3A%2BFree%2BElite%2BShooting%2BGames&test-groups=752&creative-tests=780&creative-tests=656&creative-tests=889&creative-tests=640&creative-tests=886&doubleclick-source-app-category-ids=&do-not-track=false&prevent-redirect=&using-fnf=&vast_error_code=999&asset_url=https%3A%2F%2Fasset-url.com', []);

            sinon.assert.calledWith(<sinon.SinonSpy>requestStub.get, 'https://vast-dsp.com/error?code=999&code2=999', []);
        });
    });
});
