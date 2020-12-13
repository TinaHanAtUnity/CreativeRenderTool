import { NativeBridge } from 'Core/Native/Bridge/NativeBridge';
import 'mocha';
import * as sinon from 'sinon';
import { VPAIDCampaign } from 'VPAID/Models/VPAIDCampaign';
import { VPAIDEndScreen } from 'VPAID/Views/VPAIDEndScreen';
describe('VPAIDEndScreen', () => {
    const sandbox = sinon.createSandbox();
    const nativeBridge = sinon.createStubInstance(NativeBridge);
    const vpaidCampaign = sinon.createStubInstance(VPAIDCampaign);
    beforeEach(() => {
        document.body.innerHTML = '';
    });
    afterEach(() => {
        sandbox.restore();
    });
    describe('bug fix: removeChild for non-existing element throws and results to a black screen', () => {
        it('should not try to remove end screen which is not attached to DOM', () => {
            const endScreen = new VPAIDEndScreen(nativeBridge, vpaidCampaign, '');
            endScreen.render();
            const removeChildSpy = sandbox.spy(document.body, 'removeChild');
            try {
                sandbox.stub(document.body, 'appendChild').throws();
                endScreen.show();
            }
            catch (_a) {
                // empty
            }
            endScreen.remove();
            sandbox.assert.notCalled(removeChildSpy);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURFbmRTY3JlZW5UZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vdGVzdC9Vbml0L1ZQQUlEL1ZQQUlERW5kU2NyZWVuVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDL0QsT0FBTyxPQUFPLENBQUM7QUFDZixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQztBQUMvQixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBRTVELFFBQVEsQ0FBQyxnQkFBZ0IsRUFBRSxHQUFHLEVBQUU7SUFDNUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3RDLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1RCxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsa0JBQWtCLENBQUMsYUFBYSxDQUFDLENBQUM7SUFFOUQsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNaLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztJQUNqQyxDQUFDLENBQUMsQ0FBQztJQUVILFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDWCxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDdEIsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsb0ZBQW9GLEVBQUUsR0FBRyxFQUFFO1FBQ2hHLEVBQUUsQ0FBQyxrRUFBa0UsRUFBRSxHQUFHLEVBQUU7WUFDeEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxjQUFjLENBQUMsWUFBWSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQUMsQ0FBQztZQUN0RSxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUM7WUFFbkIsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1lBRWpFLElBQUk7Z0JBQ0EsT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2dCQUNwRCxTQUFTLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDcEI7WUFBQyxXQUFNO2dCQUNKLFFBQVE7YUFDWDtZQUVELFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNuQixPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDLENBQUMifQ==