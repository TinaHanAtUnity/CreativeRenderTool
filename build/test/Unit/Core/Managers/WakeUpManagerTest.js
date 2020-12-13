import { Platform } from 'Core/Constants/Platform';
import { WakeUpManager } from 'Core/Managers/WakeUpManager';
import 'mocha';
import * as sinon from 'sinon';
import { TestFixtures } from 'TestHelpers/TestFixtures';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('WakeUpManagerTest', () => {
        let backend;
        let nativeBridge;
        let core;
        let wakeUpManager;
        beforeEach(() => {
            backend = TestFixtures.getBackend(platform);
            nativeBridge = TestFixtures.getNativeBridge(platform, backend);
            core = TestFixtures.getCoreApi(nativeBridge);
            wakeUpManager = new WakeUpManager(core);
        });
        it('should set connection listening status true', () => {
            const spy = sinon.spy(core.Connectivity, 'setListeningStatus');
            return wakeUpManager.setListenConnectivity(true).then(() => {
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, true);
            });
        });
        it('should set connection listening status false', () => {
            const spy = sinon.spy(core.Connectivity, 'setListeningStatus');
            return wakeUpManager.setListenConnectivity(false).then(() => {
                sinon.assert.calledOnce(spy);
                sinon.assert.calledWith(spy, false);
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiV2FrZVVwTWFuYWdlclRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi90ZXN0L1VuaXQvQ29yZS9NYW5hZ2Vycy9XYWtlVXBNYW5hZ2VyVGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFFbkQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRzVELE9BQU8sT0FBTyxDQUFDO0FBQ2YsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUM7QUFDL0IsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDBCQUEwQixDQUFDO0FBRXhELENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO0lBQ2hELFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxHQUFHLEVBQUU7UUFDL0IsSUFBSSxPQUFnQixDQUFDO1FBQ3JCLElBQUksWUFBMEIsQ0FBQztRQUMvQixJQUFJLElBQWMsQ0FBQztRQUNuQixJQUFJLGFBQTRCLENBQUM7UUFFakMsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLE9BQU8sR0FBRyxZQUFZLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQzVDLFlBQVksR0FBRyxZQUFZLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztZQUMvRCxJQUFJLEdBQUcsWUFBWSxDQUFDLFVBQVUsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUM3QyxhQUFhLEdBQUcsSUFBSSxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFFSCxFQUFFLENBQUMsNkNBQTZDLEVBQUUsR0FBRyxFQUFFO1lBQ25ELE1BQU0sR0FBRyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQy9ELE9BQU8sYUFBYSxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUU7Z0JBQ3ZELEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUM3QixLQUFLLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDdkMsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztRQUVILEVBQUUsQ0FBQyw4Q0FBOEMsRUFBRSxHQUFHLEVBQUU7WUFDcEQsTUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDLENBQUM7WUFDL0QsT0FBTyxhQUFhLENBQUMscUJBQXFCLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDeEQsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQzdCLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN4QyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUMsQ0FBQyJ9