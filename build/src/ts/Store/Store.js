import { AndroidStoreApi } from 'Store/Native/Android/Store';
import { GoogleStoreManager } from 'Store/Managers/GoogleStoreManager';
import { AppleStoreManager } from 'Store/Managers/AppleStoreManager';
import { Platform } from 'Core/Constants/Platform';
import { ProductsApi } from 'Store/Native/iOS/Products';
import { AppSheetApi } from 'Store/Native/iOS/AppSheet';
import { NullStoreManager } from 'Store/Managers/NullStoreManager';
import { IosUtils } from 'Ads/Utilities/IosUtils';
export class Store {
    constructor(core, analyticsManager) {
        this.Api = {
            Android: core.NativeBridge.getPlatform() === Platform.ANDROID ? {
                Store: new AndroidStoreApi(core.NativeBridge)
            } : undefined,
            iOS: core.NativeBridge.getPlatform() === Platform.IOS ? {
                Products: new ProductsApi(core.NativeBridge),
                AppSheet: new AppSheetApi(core.NativeBridge)
            } : undefined
        };
        const analyticsEnabled = core.Config.isAnalyticsEnabled();
        if (analyticsEnabled && core.NativeBridge.getPlatform() === Platform.ANDROID) {
            this.StoreManager = new GoogleStoreManager(this.Api, analyticsManager);
        }
        else if (analyticsEnabled && core.NativeBridge.getPlatform() === Platform.IOS && !IosUtils.isStoreApiBroken(core.DeviceInfo.getOsVersion())) {
            this.StoreManager = new AppleStoreManager(this.Api, analyticsManager);
        }
        else {
            this.StoreManager = new NullStoreManager(this.Api, analyticsManager);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzdELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLGtDQUFrQyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDeEQsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXhELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVsRCxNQUFNLE9BQU8sS0FBSztJQUlkLFlBQVksSUFBVyxFQUFFLGdCQUFtQztRQUV4RCxJQUFJLENBQUMsR0FBRyxHQUFHO1lBQ1AsT0FBTyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Z0JBQzVELEtBQUssRUFBRSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQ2hELENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFDYixHQUFHLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDcEQsUUFBUSxFQUFFLElBQUksV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7Z0JBQzVDLFFBQVEsRUFBRSxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2FBQy9DLENBQUMsQ0FBQyxDQUFDLFNBQVM7U0FDaEIsQ0FBQztRQUVGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBQzFELElBQUksZ0JBQWdCLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxXQUFXLEVBQUUsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQzFFLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLENBQUM7U0FDMUU7YUFBTSxJQUFJLGdCQUFnQixJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsV0FBVyxFQUFFLEtBQUssUUFBUSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksRUFBRSxDQUFDLEVBQUU7WUFDM0ksSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUN6RTthQUFNO1lBQ0gsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLGdCQUFnQixDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQztTQUN4RTtJQUNMLENBQUM7Q0FDSiJ9