import 'mocha';
import * as sinon from 'sinon';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { LoadCalledCounter, ILoadCalledCounterParams } from 'Core/Utilities/LoadCalledCounter';

describe('LoadCalledCounterTest', () => {
    let sandbox: sinon.SinonSandbox;
    let httpKafkaStub: sinon.SinonStub;
    const tsDateNow = 1234;

    const tests: {
        params: ILoadCalledCounterParams;
    }[] = [{
        params: {
            gameId: '1234',
            placementId: 'rewardedVideo',
            count: 1,
            country: 'US',
            abGroup: 99,
            organizationId: 'scottsgames-inc',
            sdkVersion: 3200,
            gamerToken: 'secretsecret'
        }
    }];

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        httpKafkaStub = sandbox.stub(HttpKafka, 'sendEvent').resolves();
        sandbox.stub(Date, 'now').returns(tsDateNow);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Sending with correct fields', () => {
        tests.forEach((t) => {
            it(`should send the correct payload"`, () => {
                LoadCalledCounter.report(t.params);
                sinon.assert.calledWith(httpKafkaStub, 'ads.load.counting', KafkaCommonObjectType.EMPTY, {
                    ...
                    t.params,
                    ts: tsDateNow
                });
            });
        });
    });
});
