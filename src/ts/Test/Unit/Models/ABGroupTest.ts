import 'mocha';
import { assert } from 'chai';
import * as sinon from 'sinon';

import { ABGroupBuilder } from 'Models/ABGroup';
import { WebView } from 'WebView';
import { NativeBridge } from 'Native/NativeBridge';
import { TestEnvironment } from 'Utilities/TestEnvironment';
import { ConfigManager } from 'Managers/ConfigManager';
import { CampaignManager } from 'Managers/CampaignManager';

describe('ABGroupBuilder tests', () => {
    describe('getAbGroup', () => {
        it('should give a valid group for numbers between 0-19', () => {
            for(let i = 0; i < 20; i++) {
                const abGroup = ABGroupBuilder.getAbGroup(i);
                assert.notEqual(abGroup.toNumber(), -1);
                assert.equal(abGroup.toNumber(), i);
            }
        });

        it('should give a valid group for 99', () => {
            const abGroup = ABGroupBuilder.getAbGroup(99);
            assert.notEqual(abGroup.toNumber(), -1);
            assert.equal(abGroup.toNumber(), 99);
        });

        it('should give group none when not valid', () => {
            const abGroup = ABGroupBuilder.getAbGroup(20);
            assert.equal(abGroup.toNumber(), -1);
        });
    });
});

describe('ABGroup tests', () => {

    // Example test of ABTest
    // describe('GdprBaseAbTest.isValid', () => {
    //     it('should return true for group 16', () => {
    //         const abGroup = ABGroupBuilder.getAbGroup(16);
    //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
    //     });

    //     it('should return true for group 17', () => {
    //         const abGroup = ABGroupBuilder.getAbGroup(17);
    //         assert.isTrue(GdprBaseAbTest.isValid(abGroup));
    //     });

    //     it('should return false for all groups not 16 and 17', () => {
    //         for (let i = -1; i < 100; i++) {
    //             if (i !== 16 && i !== 17) {
    //                 const abGroup = ABGroupBuilder.getAbGroup(i);
    //                 assert.isFalse(GdprBaseAbTest.isValid(abGroup));
    //             }
    //         }
    //     });
    // });

    describe('setupTestEnvironment in webview should set AbGroup on ConfigManager and CampaignManager', () => {
        const tests: Array<{
            metaDataGroup: any;
            expectedGroup: number | undefined;
        }> = [{
            metaDataGroup: '5',
            expectedGroup: 5
        }, {
            metaDataGroup: 'garbage',
            expectedGroup: undefined
        }, {
            metaDataGroup: undefined,
            expectedGroup: undefined
        }];
        tests.forEach((t) => {
            it(`expected group is ${t.expectedGroup} and the metadata group is ${t.metaDataGroup}`, () => {
                const nativeBridge: NativeBridge = sinon.createStubInstance(NativeBridge);
                const webview: any = new WebView(nativeBridge);
                const setupStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'setup').resolves();
                const getStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'get');
                getStub.withArgs('abGroup').returns(t.metaDataGroup);
                const promise = webview.setupTestEnvironment();
                return promise.then(() => {
                    sinon.assert.calledWith(getStub, 'abGroup');
                    let configAbGroupNumber: number | undefined;
                    const configManager = <any>ConfigManager;
                    const campaignManager = <any>CampaignManager;
                    const maybeGroup = configManager.AbGroup;
                    if (maybeGroup) {
                        configAbGroupNumber = maybeGroup.toNumber();
                    }
                    assert.equal(configAbGroupNumber, t.expectedGroup);
                    let campaignAbGroupNumber: number | undefined;
                    const maybeCampaignGroup = campaignManager.AbGroup;
                    if (maybeCampaignGroup) {
                        campaignAbGroupNumber = maybeCampaignGroup.toNumber();
                    }
                    assert.equal(campaignAbGroupNumber, t.expectedGroup);
                    configManager.AbGroup = undefined;
                    campaignManager.AbGroup = undefined;
                    getStub.restore();
                    setupStub.restore();
                }).catch((error: Error) => {
                    (<any>ConfigManager).AbGroup = undefined;
                    (<any>CampaignManager).AbGroup = undefined;
                    getStub.restore();
                    setupStub.restore();
                    throw error;
                });
            });
        });
    });
});
