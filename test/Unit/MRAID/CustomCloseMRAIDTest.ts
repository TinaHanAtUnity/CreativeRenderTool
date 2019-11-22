import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Placement } from 'Ads/Models/Placement';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { MRAIDCampaign } from 'MRAID/Models/MRAIDCampaign';
import { CustomCloseMRAID } from 'MRAID/Views/CustomCloseMRAID';
import { TestFixtures } from 'TestHelpers/TestFixtures';

import 'mocha';
import * as sinon from 'sinon';

describe('CustomCloseMRAID', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let programmaticTrackingService: ProgrammaticTrackingService;
    let placement: Placement;
    let privacyManager: UserPrivacyManager;
    let mraidCampaign: MRAIDCampaign;
    let clock: sinon.SinonFakeTimers;
    let mraid: CustomCloseMRAID;
    let container: HTMLElement;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        configuration = TestFixtures.getCoreConfiguration();
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        mraidCampaign = TestFixtures.getProgrammaticMRAIDCampaign();
        privacy = new Privacy(platform, mraidCampaign, privacyManager, false, false, 'en');
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
        placement = TestFixtures.getPlacement();
        clock = sinon.useFakeTimers();
    });

    describe('when creating CustomCloseMRAID and allowSkip returns true', () => {

        beforeEach(() => {
            placement.set('allowSkip', true);
            mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, mraidCampaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);
            mraid.render();
            mraid.show();
            container = mraid.container();
        });

        afterEach(() => {
            mraid.hide();
        });

        it('should have moved the close graphic to the left', () => {
            const region = <HTMLElement>container.querySelector('.close-region');
            assert.equal(region.style.left, '0px');
        });

        describe('when onUseCustomClose is called with true', () => {

            let closeElement: HTMLElement;

            beforeEach(() => {
                mraid.onUseCustomClose(true);
                closeElement = <HTMLElement>container.querySelector('.close');
            });

            it('should not show the close button before 5 seconds', () => {
                assert.equal(closeElement.style.display, 'none');
            });

            it('should not show the close button after 4 seconds', () => {
                clock.tick(4000);
                assert.equal(closeElement.style.display, 'none');
            });

            it('should show the close button after 5 seconds', () => {
                clock.tick(5000);
                assert.equal(closeElement.style.display, 'block');
            });

            it('should not hide the close button if onUseCustomClose is called again', () => {
                clock.tick(5000);
                mraid.onUseCustomClose(true);
                assert.equal(closeElement.style.display, 'block');
            });

        });
    });

    describe('when creating CustomCloseMRAID and allowSkip returns false', () => {

        beforeEach(() => {
            placement.set('allowSkip', false);
            mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, mraidCampaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);
            mraid.render();
            mraid.show();
            container = mraid.container();
        });

        afterEach(() => {
            mraid.hide();
        });

        it('should not move the close graphic to the left', () => {
            const region = <HTMLElement>container.querySelector('.close-region');
            assert.equal(region.style.left, '');
        });

        describe('when onUseCustomClose is called with true', () => {

            let closeElement: HTMLElement;

            beforeEach(() => {
                mraid.onUseCustomClose(true);
                closeElement = <HTMLElement>container.querySelector('.close');
            });

            it('should not show the close button before 40 seconds', () => {
                assert.equal(closeElement.style.display, 'none');
            });

            it('should not show the close button after 39 seconds', () => {
                clock.tick(39000);
                assert.equal(closeElement.style.display, 'none');
            });

            it('should show the close button after 40 seconds', () => {
                clock.tick(40000);
                assert.equal(closeElement.style.display, 'block');
            });

            it('should not hide the close button if onUseCustomClose is called again', () => {
                clock.tick(40000);
                mraid.onUseCustomClose(true);
                assert.equal(closeElement.style.display, 'block');
            });
        });
    });
});
