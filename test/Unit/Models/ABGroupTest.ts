import { assert } from 'chai';
import { ConfigManager } from 'Core/Managers/ConfigManager';
import { toAbGroup, FakeEnabledABTest, FakeDisabledABTest } from 'Core/Models/ABGroup';
import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import { TestEnvironment } from 'Core/Utilities/TestEnvironment';
import 'mocha';
import * as sinon from 'sinon';
import { WebView } from 'WebView';

describe('ABGroupTests', () => {
    const validGroups = [...Array(20).keys()];

    describe('toAbGroup', () => {
        it('should return test A/B group for number 99', () => {
            assert.equal(toAbGroup(99), 99);
        });

        it('should return a valid group for numbers between 0-19', () => {
            assert.equal(toAbGroup(validGroups[0]), 0);
            for (const i of validGroups) {
                assert.equal(toAbGroup(i), i);
            }
            assert.equal(toAbGroup(validGroups[validGroups.length - 1]), 19);
        });

        it('should return invalid group', () => {
            assert.equal(toAbGroup(-1), -1);
            assert.equal(toAbGroup(20), -1);
        });
    });

    describe('FakeEnabledABTest', () => {
        it('should return true for A/B groups 16 and 17', () => {
            assert.isTrue(FakeEnabledABTest.isValid(toAbGroup(16)));
            assert.isTrue(FakeEnabledABTest.isValid(toAbGroup(17)));
        });

        it('should return false for other A/B groups', () => {
            const invalidGroups = validGroups.filter(v => v !== 16 && v !== 17);
            for (const i of invalidGroups) {
                assert.isFalse(FakeEnabledABTest.isValid(toAbGroup(i)));
            }
        });
    });

    describe('FakeDisabledABTest tests', () => {
        it('should return false for all A/B groups', () => {
            for (const i of validGroups) {
                assert.isFalse(FakeDisabledABTest.isValid(toAbGroup(i)));
            }
            assert.isFalse(FakeDisabledABTest.isValid(99));
            assert.isFalse(FakeDisabledABTest.isValid(-1));
        });
    });

    describe('setupTestEnvironment in WebView should set AbGroup on ConfigManager and CampaignManager', () => {
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
                const webView: any = new WebView(nativeBridge);
                const setupStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'setup').resolves();
                const getStub: sinon.SinonStub = sinon.stub(TestEnvironment, 'get');
                getStub.withArgs('abGroup').returns(t.metaDataGroup);
                const promise = webView.setupTestEnvironment();
                return promise.then(() => {
                    sinon.assert.calledWith(getStub, 'abGroup');
                    let configAbGroupNumber: number | undefined;
                    const configManager = <any>ConfigManager;
                    const maybeGroup = configManager.AbGroup;
                    if (maybeGroup) {
                        configAbGroupNumber = maybeGroup;
                    }
                    assert.equal(configAbGroupNumber, t.expectedGroup);
                    configManager.AbGroup = undefined;
                    getStub.restore();
                    setupStub.restore();
                }).catch((error: Error) => {
                    (<any>ConfigManager).AbGroup = undefined;
                    getStub.restore();
                    setupStub.restore();
                    throw error;
                });
            });
        });
    });
});
