import { UserPrivacyManager } from 'Ads/Managers/UserPrivacyManager';
import { AbstractPrivacy } from 'Ads/Views/AbstractPrivacy';
import { Privacy } from 'Ads/Views/Privacy';
import { assert } from 'chai';
import { Platform } from 'Core/Constants/Platform';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Campaign } from 'Ads/Models/Campaign';

describe('Privacy settings view tests', () => {
    let platform: Platform;
    let privacyView: AbstractPrivacy;
    let campaign: Campaign;
    let userPrivacyManager: UserPrivacyManager;

    beforeEach(() => {
        platform = Platform.IOS;
        campaign = TestFixtures.getCampaign();
        userPrivacyManager = sinon.createStubInstance(UserPrivacyManager);
    });

    describe('Renders Privacy for legal framework none (gdprEnabled == false)', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, false, false, 'en');
            privacyView.render();
        });

        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.not-gdpr'));
        });

        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
    });

    describe('Renders Privacy for COPPA games', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, true, 'en');
            privacyView.render();
        });

        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.coppa'));
        });

        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));
        });
    });

    describe('Renders Privacy for Legitimate Interest (opt-out)', () => {
        beforeEach(() => {
            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, false, 'en');
            privacyView.render();
        });

        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.opt-out-flow'));
        });

        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.user-under-age-limit'));

        });
    });

    describe('Renders Privacy for under age limit users', () => {
        beforeEach(() => {
            (<sinon.SinonStub>userPrivacyManager.isUserUnderAgeLimit).returns(true);

            privacyView = new Privacy(Platform.IOS, campaign, userPrivacyManager, true, false, 'en');
            privacyView.render();
        });

        it('should render correct main div', () => {
            assert.isNotNull(privacyView.container().innerHTML);
            assert.isNotNull(privacyView.container().querySelector('.user-under-age-limit'));
        });

        it('should not render content for other privacy configurations', () => {
            assert.isNull(privacyView.container().querySelector('.not-gdpr'));
            assert.isNull(privacyView.container().querySelector('.coppa'));
            assert.isNull(privacyView.container().querySelector('.opt-out-flow'));
        });
    });
});
