import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { ABGroup, PlayableEndScreenHideDelayDisabledAbTest } from 'Models/ABGroup';
import { WebView } from 'WebView';
import { NativeBridge } from 'Native/NativeBridge';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { ConfigManager } from 'Managers/ConfigManager';
import { CampaignManager } from 'Managers/CampaignManager';

describe('ABGroup tests', () => {

    describe('getAbGroup', () => {
        it('should give a valid group for numbers between 0-19', () => {
            for(let i = 0; i < 20; i++) {
                const abGroup = ABGroup.getAbGroup(i);
                assert.notEqual(abGroup.toNumber(), -1);
                assert.equal(abGroup.toNumber(), i);
            }
        });

        it('should give a valid group for 99', () => {
            const abGroup = ABGroup.getAbGroup(99);
            assert.notEqual(abGroup.toNumber(), -1);
            assert.equal(abGroup.toNumber(), 99);
        });

        it('should give group none when not valid', () => {
            const abGroup = ABGroup.getAbGroup(20);
            assert.equal(abGroup.toNumber(), -1);
        });
    });

    // Example test of ABTest
    // describe('GdprBaseAbTest.isValid', () => {
    //     it('should return true for group 16', () => {
    //         const abGroup = ABGroup.getAbGroup(16);
    //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
    //     });

    //     it('should return true for group 17', () => {
    //         const abGroup = ABGroup.getAbGroup(17);
    //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
    //     });

    //     it('should return false for all groups not 16 and 17', () => {
    //         for (let i = -1; i < 100; i++) {
    //             if (i !== 16 && i !== 17) {
    //                 const abGroup = ABGroup.getAbGroup(i);
    //                 assert.isFalse(GdprBaseAbTest.isValid(abGroup));
    //             }
    //         }
    //     });
    // });

    describe('PlayableEndScreenHideDelayDisabledAbTest.isValid', () => {
        it('should return true for group 18', () => {
            const abGroup = ABGroup.getAbGroup(18);
            assert.isTrue(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
        });

        it('should return true for group 19', () => {
            const abGroup = ABGroup.getAbGroup(19);
            assert.isTrue(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
        });

        it('should return false for all groups not 18 and 19', () => {
            for (let i = -1; i < 100; i++) {
                if (i !== 18 && i !== 19) {
                    const abGroup = ABGroup.getAbGroup(i);
                    assert.isFalse(PlayableEndScreenHideDelayDisabledAbTest.isValid(abGroup));
                }
            }
        });
    });

    describe('setupTestEnvironment in webview should set AbGroup on ConfigManager and CampaignManager', () => {
        const nativeBridge: NativeBridge = sinon.createStubInstance(NativeBridge);
        const webview = new WebView(nativeBridge);
        const setupStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'setup').resolves();
        const getStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'get');
        getStub.withArgs('abGroup').returns('5');
        // tslint:disable
        const promise = webview['setupTestEnvironment']();
        // tslint:enable
        return promise.then(() => {
            sinon.assert.calledWith(getStub, 'abGroup');
            // tslint:disable
            const maybeGroup = ConfigManager['AbGroup'];
            // tslint:enable
            if (maybeGroup) {
                const abGroupNumber = maybeGroup.toNumber();
                assert.equal(abGroupNumber, 5);
            } else {
                assert.fail('ConfigManager.AbGroup should not be undefined');
            }
            // tslint:disable
            const maybeCampaignGroup = CampaignManager['AbGroup'];
            // tslint:enable
            if (maybeCampaignGroup) {
                const abGroupNumber = maybeCampaignGroup.toNumber();
                assert.equal(abGroupNumber, 5);
            } else {
                assert.fail('CampaignManager.AbGroup should not be undefined');
            }
            // tslint:disable
            ConfigManager['AbGroup'] = undefined;
            CampaignManager['AbGroup'] = undefined;
            // tslint:enbale
            getStub.restore();
            setupStub.restore();
        }).catch((error) => {
            // tslint:disable
            ConfigManager['AbGroup'] = undefined;
            CampaignManager['AbGroup'] = undefined;
            // tslint:enbale
            getStub.restore();
            setupStub.restore();
            throw error;
        });
    });
});
