import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { ARMRAID } from 'AR/Views/ARMRAID';
import { MRAIDAdUnit } from 'MRAID/AdUnits/MRAIDAdUnit';
import { PerformanceMRAIDCampaign } from 'Performance/Models/PerformanceMRAIDCampaign';
import { PerformanceMRAIDEventHandler } from 'MRAID/EventHandlers/PerformanceMRAIDEventHandler';
import { ProgrammaticMRAIDEventHandler } from 'MRAID/EventHandlers/ProgrammaticMRAIDEventHandler';
import { WebPlayerMRAIDAdUnit } from 'MRAID/AdUnits/WebPlayerMRAIDAdUnit';
import { MraidWebplayerTest } from 'Core/Models/ABGroup';
export class MRAIDAdUnitFactory extends AbstractAdUnitFactory {
    createAdUnit(parameters) {
        const mraidAdUnit = this.getMRAIDAdUnit(parameters);
        const mraidEventHandler = this.getMRAIDEventHandler(mraidAdUnit, parameters);
        parameters.mraid.addEventHandler(mraidEventHandler);
        return mraidAdUnit;
    }
    getMRAIDEventHandler(mraidAdUnit, parameters) {
        const isPerformanceMRAID = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isARMRAID = parameters.mraid instanceof ARMRAID;
        const isProgrammaticWebPlayerTest = MraidWebplayerTest.isValid(parameters.coreConfig.getAbGroup()) && !isPerformanceMRAID && !isARMRAID;
        if (isProgrammaticWebPlayerTest) {
            return new ProgrammaticMRAIDEventHandler(mraidAdUnit, parameters);
        }
        else {
            if (isPerformanceMRAID) {
                return new PerformanceMRAIDEventHandler(mraidAdUnit, parameters);
            }
            else {
                return new ProgrammaticMRAIDEventHandler(mraidAdUnit, parameters);
            }
        }
    }
    getMRAIDAdUnit(parameters) {
        let mraidAdUnit;
        const isPerformanceMRAID = parameters.campaign instanceof PerformanceMRAIDCampaign;
        const isARMRAID = parameters.mraid instanceof ARMRAID;
        const isProgrammaticWebPlayerTest = MraidWebplayerTest.isValid(parameters.coreConfig.getAbGroup()) && !isPerformanceMRAID && !isARMRAID;
        if (isProgrammaticWebPlayerTest) {
            mraidAdUnit = new WebPlayerMRAIDAdUnit(parameters);
        }
        else {
            mraidAdUnit = new MRAIDAdUnit(parameters);
        }
        return mraidAdUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTVJBSURBZFVuaXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL01SQUlEL0FkVW5pdHMvTVJBSURBZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUMzQyxPQUFPLEVBQTBCLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBR2hGLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLDZDQUE2QyxDQUFDO0FBQ3ZGLE9BQU8sRUFBRSw0QkFBNEIsRUFBRSxNQUFNLGtEQUFrRCxDQUFDO0FBQ2hHLE9BQU8sRUFBRSw2QkFBNkIsRUFBRSxNQUFNLG1EQUFtRCxDQUFDO0FBQ2xHLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBRXpELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxxQkFBNEQ7SUFDekYsWUFBWSxDQUFDLFVBQWtDO1FBRWxELE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDcEQsTUFBTSxpQkFBaUIsR0FBc0IsSUFBSSxDQUFDLG9CQUFvQixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUNoRyxVQUFVLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBRXBELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7SUFFTyxvQkFBb0IsQ0FBQyxXQUF3QixFQUFFLFVBQWtDO1FBRXJGLE1BQU0sa0JBQWtCLEdBQUcsVUFBVSxDQUFDLFFBQVEsWUFBWSx3QkFBd0IsQ0FBQztRQUNuRixNQUFNLFNBQVMsR0FBRyxVQUFVLENBQUMsS0FBSyxZQUFZLE9BQU8sQ0FBQztRQUN0RCxNQUFNLDJCQUEyQixHQUFHLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUV4SSxJQUFJLDJCQUEyQixFQUFFO1lBQzdCLE9BQU8sSUFBSSw2QkFBNkIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7U0FDckU7YUFBTTtZQUNILElBQUksa0JBQWtCLEVBQUU7Z0JBQ3BCLE9BQU8sSUFBSSw0QkFBNEIsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDcEU7aUJBQU07Z0JBQ0gsT0FBTyxJQUFJLDZCQUE2QixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQzthQUNyRTtTQUNKO0lBQ0wsQ0FBQztJQUVPLGNBQWMsQ0FBQyxVQUFrQztRQUNyRCxJQUFJLFdBQXdCLENBQUM7UUFFN0IsTUFBTSxrQkFBa0IsR0FBRyxVQUFVLENBQUMsUUFBUSxZQUFZLHdCQUF3QixDQUFDO1FBQ25GLE1BQU0sU0FBUyxHQUFHLFVBQVUsQ0FBQyxLQUFLLFlBQVksT0FBTyxDQUFDO1FBQ3RELE1BQU0sMkJBQTJCLEdBQUcsa0JBQWtCLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLENBQUMsU0FBUyxDQUFDO1FBRXhJLElBQUksMkJBQTJCLEVBQUU7WUFDN0IsV0FBVyxHQUFHLElBQUksb0JBQW9CLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDdEQ7YUFBTTtZQUNILFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztTQUM3QztRQUVELE9BQU8sV0FBVyxDQUFDO0lBQ3ZCLENBQUM7Q0FDSiJ9