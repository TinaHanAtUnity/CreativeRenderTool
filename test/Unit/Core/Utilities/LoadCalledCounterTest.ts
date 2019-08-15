import 'mocha';
import * as sinon from 'sinon';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { LoadCalledCounter } from 'Core/Utilities/LoadCalledCounter';
import { ABGroup } from 'Core/Models/ABGroup';

describe('LoadCalledCounterTest', () => {
    let sandbox: sinon.SinonSandbox;
    let httpKafkaStub: sinon.SinonStub;

    const tests: {
        kafkaObject: {
            gameId: string;
            placementId: string;
            country: string;
            count: number;
            abGroup: ABGroup;
            organizationId: string;
            ts: number;
         };
    }[] = [{
        kafkaObject: {
            gameId: '1234',
            placementId: 'rewardedVideo',
            count: 1,
            country: 'US',
            abGroup: 99,
            organizationId: 'scottsgames-inc',
            ts: 1234
        }
    }];

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        httpKafkaStub = sandbox.stub(HttpKafka, 'sendEvent').resolves();
        sandbox.stub(Date, 'now').returns(1234);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Sending with correct fields', () => {
        tests.forEach((t) => {
            it(`should send the correct payload"`, () => {
                const x = t.kafkaObject;
                LoadCalledCounter.report(x.gameId, x.placementId, x.country, x.count, x.abGroup, x.organizationId);
                sinon.assert.calledWith(httpKafkaStub, 'ads.load.counting', KafkaCommonObjectType.EMPTY, t.kafkaObject);
            });
        });
    });
});
