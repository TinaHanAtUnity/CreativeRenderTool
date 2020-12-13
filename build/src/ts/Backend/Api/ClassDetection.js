import { BackendApi } from 'Backend/BackendApi';
import { Platform } from 'Core/Constants/Platform';
export class ClassDetection extends BackendApi {
    constructor() {
        super(...arguments);
        this._classesArePresent = false;
        this._platform = Platform.TEST;
    }
    setClassesArePresent(present) {
        this._classesArePresent = present;
    }
    setPlatform(platform) {
        this._platform = platform;
    }
    areClassesPresent(className) {
        if (this._classesArePresent) {
            if (this._platform === Platform.ANDROID) {
                return [{ class: 'com.unity3d.player.UnityPlayer', found: true }];
            }
            if (this._platform === Platform.IOS) {
                return [{ class: 'UnityAppController', found: true }];
            }
            return [];
        }
        if (this._platform === Platform.ANDROID) {
            return [{ class: 'com.unity3d.player.UnityPlayer', found: false }];
        }
        if (this._platform === Platform.IOS) {
            return [{ class: 'UnityAppController', found: false }];
        }
        return [];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2xhc3NEZXRlY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFja2VuZC9BcGkvQ2xhc3NEZXRlY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFVBQVU7SUFBOUM7O1FBRVksdUJBQWtCLEdBQVksS0FBSyxDQUFDO1FBQ3BDLGNBQVMsR0FBYSxRQUFRLENBQUMsSUFBSSxDQUFDO0lBMEJoRCxDQUFDO0lBekJVLG9CQUFvQixDQUFDLE9BQWdCO1FBQ3hDLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxPQUFPLENBQUM7SUFDdEMsQ0FBQztJQUNNLFdBQVcsQ0FBQyxRQUFrQjtRQUNsQyxJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBRU0saUJBQWlCLENBQUMsU0FBbUI7UUFDeEMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEVBQUU7WUFDekIsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7Z0JBQ3JDLE9BQU8sQ0FBQyxFQUFFLEtBQUssRUFBRSxnQ0FBZ0MsRUFBRSxLQUFLLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQzthQUNyRTtZQUNELElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsR0FBRyxFQUFFO2dCQUNqQyxPQUFPLENBQUMsRUFBRSxLQUFLLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7YUFDekQ7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxPQUFPLEVBQUU7WUFDckMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLGdDQUFnQyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQ3RFO1FBQ0QsSUFBSSxJQUFJLENBQUMsU0FBUyxLQUFLLFFBQVEsQ0FBQyxHQUFHLEVBQUU7WUFDakMsT0FBTyxDQUFDLEVBQUUsS0FBSyxFQUFFLG9CQUFvQixFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO1NBQzFEO1FBQ0QsT0FBTyxFQUFFLENBQUM7SUFDZCxDQUFDO0NBQ0oifQ==