import { assert } from 'chai';
import 'mocha';
import { PrivacyConfig } from 'Privacy/PrivacyConfig';

describe('PrivacyConfigTest', () => {
    let privacyConfig: PrivacyConfig;
    const flow = { testFlowValue: 'testFlowValue'};
    const userSettings = { ads: false, external: false, gameExp: false, agreedOverAgeLimit: false, agreementMethod: '' };
    const env = { testEnvValue: 'testEnvValue'};
    const html = '<html></html>';

    beforeEach(() => {
        privacyConfig = new PrivacyConfig(flow, userSettings, env, html);
    });

    context('Created as expected', () => {
        it ('Flow', () => {
           assert.deepEqual(privacyConfig.getFlow(), flow);
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
