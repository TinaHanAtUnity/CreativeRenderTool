import { assert } from 'chai';
import 'mocha';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';
import { AgeGateChoice } from 'Ads/Managers/UserPrivacyManager';

describe('PrivacyConfigTest', () => {
    let privacyConfig: PrivacyConfig;
    const nodes = { testNode: 'testNode' };
    const userSettings = {
        ads: false,
        external: false,
        gameExp: false,
        ageGateChoice: AgeGateChoice.NO,
        agreementMethod: ''
    };
    const env = { testEnvValue: 'testEnvValue' };
    const html = '<html></html>';

    beforeEach(() => {
        privacyConfig = new PrivacyConfig(env, userSettings, '', html, nodes, {});
    });

    context('Created as expected', () => {
        it ('Flow', () => {
           assert.deepEqual(privacyConfig.getFlow(), nodes);
        });

        it ('UserSettings', () => {
           assert.deepEqual(privacyConfig.getUserSettings(), userSettings);
        });

        it ('Environment', () => {
            assert.deepEqual(privacyConfig.getEnv(), env);
        });

        it ('Html', () => {
            assert.deepEqual(privacyConfig.getHtml(), html);
        });
    });
});
