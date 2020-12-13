import { ApiPackage, NativeApi } from 'Core/Native/Bridge/NativeApi';
import { EventCategory } from 'Core/Constants/EventCategory';
import { Observable1 } from 'Core/Utilities/Observable';
export var LoadEvent;
(function (LoadEvent) {
    LoadEvent[LoadEvent["LOAD_PLACEMENTS"] = 0] = "LOAD_PLACEMENTS";
})(LoadEvent || (LoadEvent = {}));
export class LoadApi extends NativeApi {
    constructor(nativeBridge) {
        super(nativeBridge, 'Load', ApiPackage.ADS, EventCategory.LOAD_API);
        this.onLoad = new Observable1();
    }
    handleEvent(event, parameters) {
        switch (event) {
            case LoadEvent[LoadEvent.LOAD_PLACEMENTS]:
                this.handleLoadPlacements(parameters[0]);
                break;
            default:
                super.handleEvent(event, parameters);
        }
    }
    handleLoadPlacements(placements) {
        if (placements) {
            this.onLoad.trigger(placements);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9hZEFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9Db3JlL05hdGl2ZS9Mb2FkQXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDckUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUV4RCxNQUFNLENBQU4sSUFBWSxTQUVYO0FBRkQsV0FBWSxTQUFTO0lBQ2pCLCtEQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUZXLFNBQVMsS0FBVCxTQUFTLFFBRXBCO0FBRUQsTUFBTSxPQUFPLE9BQVEsU0FBUSxTQUFTO0lBSWxDLFlBQVksWUFBMEI7UUFDbEMsS0FBSyxDQUFDLFlBQVksRUFBRSxNQUFNLEVBQUUsVUFBVSxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7UUFIeEQsV0FBTSxHQUFHLElBQUksV0FBVyxFQUEyQixDQUFDO0lBSXBFLENBQUM7SUFFTSxXQUFXLENBQUMsS0FBYSxFQUFFLFVBQXFCO1FBQ25ELFFBQVEsS0FBSyxFQUFFO1lBQ1gsS0FBSyxTQUFTLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQztnQkFDckMsSUFBSSxDQUFDLG9CQUFvQixDQUEwQixVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDbEUsTUFBTTtZQUVWO2dCQUNJLEtBQUssQ0FBQyxXQUFXLENBQUMsS0FBSyxFQUFFLFVBQVUsQ0FBQyxDQUFDO1NBQzVDO0lBQ0wsQ0FBQztJQUVPLG9CQUFvQixDQUFDLFVBQW1DO1FBQzVELElBQUksVUFBVSxFQUFFO1lBQ1osSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDbkM7SUFDTCxDQUFDO0NBQ0oifQ==