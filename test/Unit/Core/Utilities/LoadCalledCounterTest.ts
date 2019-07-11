import 'mocha';
import * as sinon from 'sinon';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { LoadCalledCounter } from 'Core/Utilities/LoadCalledCounter';

describe('LoadCalledCounterTest', () => {
    let httpKafkaStub: sinon.SinonStub;

    const tests: {
        kafkaObject: { [key: string]: string };
    }[] = [{
        kafkaObject: {
            gameId: '1234',
            placementId: 'rewardedVideo'
        }
    }];

    beforeEach(() => {
        httpKafkaStub = sinon.stub(HttpKafka, 'sendEvent').resolves();
    });

    afterEach(() => {
        httpKafkaStub.reset();
    });

    describe('Sending with correct fields', () => {
        tests.forEach((t) => {
            it(`should send the correct payload"`, () => {
                LoadCalledCounter.report(t.kafkaObject.gameId, t.kafkaObject.placementId);
                sinon.assert.calledWith(httpKafkaStub, 'ads.load.counting', KafkaCommonObjectType.EMPTY, t.kafkaObject);
            });
        });
    });
});
