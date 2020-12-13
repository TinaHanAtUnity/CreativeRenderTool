import { CreativeBlocking, BlockingReason } from 'Core/Utilities/CreativeBlocking';
import 'mocha';
import * as sinon from 'sinon';
import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { VastErrorInfo, VastErrorCode } from 'VAST/EventHandlers/VastCampaignErrorHandler';
describe('CreativeBlockingTest', () => {
    let httpKafkaStub;
    const tests = [{
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
        httpKafkaStub.reset();
    });
    describe('Sending with correct fields ', () => {
        const creativeId = 'fake-creative-id';
        const seatId = 900;
        const campaignId = 'foo';
        tests.forEach((t) => {
            it(`should send matching payload when blockingReason is "${t.blockingReason}"`, () => {
                CreativeBlocking.report(creativeId, seatId, campaignId, t.blockingReason, t.extraFields);
                sinon.assert.calledWith(httpKafkaStub, 'ads.creative.blocking', KafkaCommonObjectType.EMPTY, Object.assign({}, t.extraFields, { type: t.blockingReason, creativeId: creativeId, seatId: seatId, campaignId: campaignId }));
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ3JlYXRpdmVCbG9ja2luZ1Rlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9VdGlsaXRpZXMvQ3JlYXRpdmVCbG9ja2luZ1Rlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGNBQWMsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25GLE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFNBQVMsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBQzVFLE9BQU8sRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFFLE1BQU0sNkNBQTZDLENBQUM7QUFFM0YsUUFBUSxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtJQUNsQyxJQUFJLGFBQThCLENBQUM7SUFFbkMsTUFBTSxLQUFLLEdBR0wsQ0FBQztZQUNILGNBQWMsRUFBRSxjQUFjLENBQUMsY0FBYztZQUM3QyxXQUFXLEVBQUU7Z0JBQ1QsVUFBVSxFQUFFLEVBQUU7YUFDakI7U0FDSixFQUFFO1lBQ0MsY0FBYyxFQUFFLGNBQWMsQ0FBQyxjQUFjO1lBQzdDLFdBQVcsRUFBRTtnQkFDVCxhQUFhLEVBQUUsS0FBSzthQUN2QjtTQUNKLEVBQUU7WUFDQyxjQUFjLEVBQUUsY0FBYyxDQUFDLG1CQUFtQjtZQUNsRCxXQUFXLEVBQUU7Z0JBQ1QsV0FBVyxFQUFFLEdBQUc7Z0JBQ2hCLFNBQVMsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQzthQUNwRTtTQUNKLEVBQUU7WUFDQyxjQUFjLEVBQUUsY0FBYyxDQUFDLFdBQVc7WUFDMUMsV0FBVyxFQUFFO2dCQUNULFNBQVMsRUFBRSxXQUFXO2FBQ3pCO1NBQ0osQ0FBQyxDQUFDO0lBRUgsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLGFBQWEsR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNsRSxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDMUIsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsOEJBQThCLEVBQUUsR0FBRyxFQUFFO1FBQzFDLE1BQU0sVUFBVSxHQUFHLGtCQUFrQixDQUFDO1FBQ3RDLE1BQU0sTUFBTSxHQUFHLEdBQUcsQ0FBQztRQUNuQixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUM7UUFFekIsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ2hCLEVBQUUsQ0FBQyx3REFBd0QsQ0FBQyxDQUFDLGNBQWMsR0FBRyxFQUFFLEdBQUcsRUFBRTtnQkFDakYsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2dCQUN6RixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxhQUFhLEVBQUUsdUJBQXVCLEVBQUUscUJBQXFCLENBQUMsS0FBSyxvQkFDcEYsQ0FBQyxDQUFDLFdBQVcsSUFDaEIsSUFBSSxFQUFFLENBQUMsQ0FBQyxjQUFjLEVBQ3RCLFVBQVUsRUFBRSxVQUFVLEVBQ3RCLE1BQU0sRUFBRSxNQUFNLEVBQ2QsVUFBVSxFQUFFLFVBQVUsSUFDeEIsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=