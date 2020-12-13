import { AbstractAdUnitFactory } from 'Ads/AdUnits/AbstractAdUnitFactory';
import { VPAIDAdUnit } from 'VPAID/AdUnits/VPAIDAdUnit';
import { VPAIDOverlayEventHandler } from 'VPAID/EventHandlers/VPAIDOverlayEventHandler';
import { VPAIDEventHandler } from 'VPAID/EventHandlers/VPAIDEventHandler';
import { VPAIDEndScreenEventHandler } from 'VPAID/EventHandlers/VPAIDEndScreenEventHandler';
export class VPAIDAdUnitFactory extends AbstractAdUnitFactory {
    createAdUnit(parameters) {
        const vpaidAdUnit = new VPAIDAdUnit(parameters);
        const vpaidEventHandler = new VPAIDEventHandler(vpaidAdUnit, {
            ads: parameters.ads,
            core: parameters.core,
            closer: parameters.closer,
            endScreen: parameters.endScreen,
            operativeEventManager: parameters.operativeEventManager,
            thirdPartyEventManager: parameters.thirdPartyEventManager,
            placement: parameters.placement,
            campaign: parameters.campaign
        });
        parameters.vpaid.addEventHandler(vpaidEventHandler);
        const overlayEventHandler = new VPAIDOverlayEventHandler(vpaidAdUnit, parameters);
        parameters.closer.addEventHandler(overlayEventHandler);
        if (parameters.campaign.hasEndScreen() && parameters.endScreen) {
            const endScreenEventHandler = new VPAIDEndScreenEventHandler(vpaidAdUnit, parameters);
            parameters.endScreen.addEventHandler(endScreenEventHandler);
        }
        return vpaidAdUnit;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVlBBSURBZFVuaXRGYWN0b3J5LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL1ZQQUlEL0FkVW5pdHMvVlBBSURBZFVuaXRGYWN0b3J5LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBRzFFLE9BQU8sRUFBMEIsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFaEYsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sOENBQThDLENBQUM7QUFDeEYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sdUNBQXVDLENBQUM7QUFDMUUsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFLNUYsTUFBTSxPQUFPLGtCQUFtQixTQUFRLHFCQUE0RDtJQUV6RixZQUFZLENBQUMsVUFBa0M7UUFDbEQsTUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFaEQsTUFBTSxpQkFBaUIsR0FBRyxJQUFJLGlCQUFpQixDQUFDLFdBQVcsRUFBRTtZQUN6RCxHQUFHLEVBQUUsVUFBVSxDQUFDLEdBQUc7WUFDbkIsSUFBSSxFQUFFLFVBQVUsQ0FBQyxJQUFJO1lBQ3JCLE1BQU0sRUFBRSxVQUFVLENBQUMsTUFBTTtZQUN6QixTQUFTLEVBQUUsVUFBVSxDQUFDLFNBQVM7WUFDL0IscUJBQXFCLEVBQUUsVUFBVSxDQUFDLHFCQUFxQjtZQUN2RCxzQkFBc0IsRUFBRSxVQUFVLENBQUMsc0JBQXNCO1lBQ3pELFNBQVMsRUFBRSxVQUFVLENBQUMsU0FBUztZQUMvQixRQUFRLEVBQUUsVUFBVSxDQUFDLFFBQVE7U0FDaEMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNwRCxNQUFNLG1CQUFtQixHQUFHLElBQUksd0JBQXdCLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBQ2xGLFVBQVUsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFFdkQsSUFBSSxVQUFVLENBQUMsUUFBUSxDQUFDLFlBQVksRUFBRSxJQUFJLFVBQVUsQ0FBQyxTQUFTLEVBQUU7WUFDNUQsTUFBTSxxQkFBcUIsR0FBRyxJQUFJLDBCQUEwQixDQUFDLFdBQVcsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN0RixVQUFVLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQy9EO1FBRUQsT0FBTyxXQUFXLENBQUM7SUFDdkIsQ0FBQztDQUVKIn0=