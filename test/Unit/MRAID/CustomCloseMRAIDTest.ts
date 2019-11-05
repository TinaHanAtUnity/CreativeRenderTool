import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { Campaign } from 'Ads/Models/Campaign';
import { Placement } from 'Ads/Models/Placement';
import { Privacy } from 'Ads/Views/Privacy';
import { Backend } from 'Backend/Backend';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import { ICoreApi } from 'Core/ICore';
import { CoreConfiguration } from 'Core/Models/CoreConfiguration';
import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';

import 'mocha';
import { CustomCloseMRAID } from 'MRAID/Views/CustomCloseMRAID';

import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';

describe('CustomCloseMRAID', () => {
    let platform: Platform;
    let backend: Backend;
    let nativeBridge: NativeBridge;
    let core: ICoreApi;
    let configuration: CoreConfiguration;
    let privacy: Privacy;
    let privacyManager: UserPrivacyManager;
    let fakeCampaign: Campaign;
    let programmaticTrackingService: ProgrammaticTrackingService;

    beforeEach(() => {
        platform = Platform.ANDROID;
        backend = TestFixtures.getBackend(platform);
        nativeBridge = TestFixtures.getNativeBridge(platform, backend);
        core = TestFixtures.getCoreApi(nativeBridge);
        configuration = TestFixtures.getCoreConfiguration();
        privacyManager = sinon.createStubInstance(UserPrivacyManager);
        fakeCampaign = sinon.createStubInstance(Campaign);
        privacy = new Privacy(platform, fakeCampaign, privacyManager, false, false, 'en');
        programmaticTrackingService = sinon.createStubInstance(ProgrammaticTrackingService);
    });

    it('should move close graphic to the left when skippable', () => {
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });

        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);

        mraid.render();
        mraid.show();

        const container = mraid.container();
        const region = <HTMLElement>container.querySelector('.close-region');
        assert.equal(region.style.left, '0px');

        mraid.hide();
    });

    it('should hide timer for 5 seconds when skippable', () => {
        const clock = sinon.useFakeTimers();
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: true,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });

        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);

        mraid.render();
        mraid.show();
        mraid.onUseCustomClose(true);

        const container = mraid.container();
        const close = <HTMLElement>container.querySelector('.close');
        assert.equal(close.style.display, 'none');

        clock.tick(4000);
        assert.equal(close.style.display, 'none');

        clock.tick(1000);
        assert.equal(close.style.display, 'block');

        mraid.hide();
    });

    it('should keep close graphic on the right when not skippable', () => {
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: false,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });

        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);

        mraid.render();
        mraid.show();

        const container = mraid.container();
        const region = <HTMLElement>container.querySelector('.close-region');
        assert.equal(region.style.left, '');

        mraid.hide();
    });

    it('should hide timer for 40 seconds when not skippable', () => {
        const clock = sinon.useFakeTimers();
        const placement = new Placement({
            id: '123',
            name: 'test',
            default: true,
            allowSkip: false,
            skipInSeconds: 5,
            disableBackButton: true,
            useDeviceOrientationForVideo: false,
            skipEndCardOnClose: false,
            disableVideoControlsFade: false,
            useCloseIconInsteadOfSkipIcon: false,
            adTypes: [],
            refreshDelay: 1000,
            muteVideo: false
        });

        const campaign = TestFixtures.getProgrammaticMRAIDCampaign();
        const mraid = new CustomCloseMRAID(platform, core, TestFixtures.getAndroidDeviceInfo(core), placement, campaign, privacy, false, configuration.getAbGroup(), programmaticTrackingService);

        mraid.render();
        mraid.show();
        mraid.onUseCustomClose(true);

        const container = mraid.container();
        const close = <HTMLElement>container.querySelector('.close');
        assert.equal(close.style.display, 'none');

        clock.tick(39000);
        assert.equal(close.style.display, 'none');

        clock.tick(1000);
        assert.equal(close.style.display, 'block');

        mraid.hide();
    });

});
