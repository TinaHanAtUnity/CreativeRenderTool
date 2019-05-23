import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
import 'mocha';
import * as sinon from 'sinon';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';

describe('Creative Blocking', () => {
    let httpKafkaStub: sinon.SinonSpy;

    const tests: {
        blockingReason: BlockingReason;
        extraFields: any;
    }[] = [{
        blockingReason: BlockingReason.FILE_TOO_LARGE,
        extraFields: {
            'fileSize': 20
        }
    }, {
        blockingReason: BlockingReason.VIDEO_TOO_LONG,
        extraFields: {
            'videoLength': 40516
        }
    }, {
        blockingReason: BlockingReason.VIDEO_PARSE_FAILURE,
        extraFields: {
            'errorCode': 100,
            'message': VastErrorInfo.errorMap[VastErrorCode.XML_PARSER_ERROR]
        }
    }, {
        blockingReason: BlockingReason.USER_REPORT,
        extraFields: {
            'message': 'OFFENSIVE'
        }
    }];

    beforeEach(() => {
        httpKafkaStub = sinon.stub(HttpKafka, 'sendEvent').resolves();
    });

    afterEach(() => {
        httpKafkaStub.resetHistory();
    });

    describe('Sending with correct fields ', () => {
        const creativeId = 'fake-creative-id';
        const seatId = 900;
        const campaignId = 'foo';

        tests.forEach((t) => {
            it(`should send matching payload when blockingReason is "${t.blockingReason}"`, () => {
                CreativeBlocking.report(creativeId, seatId, campaignId, t.blockingReason, t.extraFields);
                httpKafkaStub.calledWithExactly('ads.creative.blocking', KafkaCommonObjectType.EMPTY, {
                    ...t.extraFields,
                    type: t.blockingReason,
                    creativeId: creativeId,
                    seatId: seatId,
                    campaignId: campaignId
                });
            });
        });
    });
});
