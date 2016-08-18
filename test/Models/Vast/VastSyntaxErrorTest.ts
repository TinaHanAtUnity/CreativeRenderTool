import 'mocha';
import { assert } from 'chai';
import { VastSyntaxError } from '../../../src/ts/Models/Vast/VastSyntaxError';

describe('VastSyntaxError', () => {
    it('should convert VastSyntaxError object to Kafka format used for logging', () => {
        let vastSynaxError = new VastSyntaxError('message', 'failingContent', 1, 'stack');
        vastSynaxError.rootWrapperVast = 'rootWrapperVast';

        let kafkaError = vastSynaxError.toKafkaFormat();

        assert.deepEqual(kafkaError,
            {
                message: 'message',
                name: 'VastSyntaxError',
                stack: vastSynaxError.stack,
                failingContent: 'failingContent',
                wrapperDepth: 1,
                rootWrapperVast: 'rootWrapperVast'
            }
        );
    });
});
