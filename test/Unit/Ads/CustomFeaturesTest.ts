import { CustomFeatures } from 'Ads/Utilities/CustomFeatures';
import { assert } from 'chai';
import 'mocha';
import { TestFixtures } from 'TestHelpers/TestFixtures';
import { Platform } from 'Core/Constants/Platform';
import { IosUtils } from 'Ads/Utilities/IosUtils';
import * as sinon from 'sinon';
import { InstallInRewardedVideos, toAbGroup } from 'Core/Models/ABGroup';

describe('CustomFeatures', () => {

    describe('isExampleGameId', () => {
        it('should return true if gameId is 14850', () => {
            const value = CustomFeatures.isExampleGameId('14850');
            assert.isTrue(value);
        });

        it('should return true if gameId is 14851', () => {
            const value = CustomFeatures.isExampleGameId('14851');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 14850 and 14851', () => {
            const value = CustomFeatures.isExampleGameId('14852');
            assert.isFalse(value);
        });
    });

    describe('isTimehopApp', () => {
        it('should return true if gameId is 1300023', () => {
            const value = CustomFeatures.isTimehopApp('1300023');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1300024', () => {
            const value = CustomFeatures.isTimehopApp('1300024');
            assert.isTrue(value);
        });

        it('should return false if gameId is anything besides 1300023 and 1300024', () => {
            const value = CustomFeatures.isTimehopApp('1300025');
            assert.isFalse(value);
        });
    });

    describe('isZyngaGame', () => {
        it('should return true if gameId is 98530', () => {
            const value = CustomFeatures.isZyngaGame('98530');
            assert.isTrue(value);
        });

        it('should return true if gameId is 21739', () => {
            const value = CustomFeatures.isZyngaGame('21739');
            assert.isTrue(value);
        });

        it('should return false if gameId is 99999', () => {
            const value = CustomFeatures.isZyngaGame('99999');
            assert.isFalse(value);
        });
    });

    describe('isCloseIconSkipEnabled', () => {
        it('should return true if gameId is 2808037 (Cheetah GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('2808037');
            assert.isTrue(value);
        });

        it('should return true if gameId is 2907326 (Bitmango GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('2907326');
            assert.isTrue(value);
        });

        it('should return true if gameId is 1558951 (Game7 GameID)', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('1558951');
            assert.isTrue(value);
        });

        it('should return false if gameId is 99999', () => {
            const value = CustomFeatures.isCloseIconSkipEnabled('99999');
            assert.isFalse(value);
        });
    });

    describe('isRewardedVideoInstallButtonEnabled', () => {
        const coreConfig = TestFixtures.getCoreConfiguration();
        const campaign = TestFixtures.getCampaign();
        let coreConfigStub: sinon.SinonStub;

        beforeEach(() => {
            coreConfigStub = sinon.stub(coreConfig, 'getAbGroup').returns(toAbGroup(7));
        });

        describe('Android', () => {
            it('should return true when ABGroup is correct', () => {
                const isEnabled = CustomFeatures.isRewardedVideoInstallButtonEnabled(campaign, coreConfig);
                assert.isTrue(isEnabled);
            });

            it('should return false when user is in AB group that does not have the test enabled', () => {
                coreConfigStub.restore();
                sinon.stub(coreConfig, 'getAbGroup').returns(toAbGroup(0));
                const isEnabled = CustomFeatures.isRewardedVideoInstallButtonEnabled(campaign, coreConfig);
                assert.isFalse(isEnabled);
            });
        });

        describe('iOS', () => {
            it('should return true when ABGroup is correct', () => {
                const isEnabled = CustomFeatures.isRewardedVideoInstallButtonEnabled(campaign, coreConfig);
                assert.isTrue(isEnabled);
            });

            it('should return false when in AB group that does not have the test enabled', () => {
                coreConfigStub.restore();
                sinon.stub(coreConfig, 'getAbGroup').returns(toAbGroup(0));
                sinon.stub(IosUtils, 'isAppSheetBroken').returns(true);
                const isEnabled = CustomFeatures.isRewardedVideoInstallButtonEnabled(campaign, coreConfig);
                assert.isFalse(isEnabled);
            });
        });
    });
});
