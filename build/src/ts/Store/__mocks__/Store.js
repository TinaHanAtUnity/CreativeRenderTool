import { StoreManager } from 'Store/__mocks__/StoreManager';
import { AndroidStoreApi } from 'Store/Native/Android/__mocks__/AndroidStoreApi';
import { AppSheetApi } from 'Store/Native/iOS/__mocks__/AppsheetApi';
import { ProductsApi } from 'Store/Native/iOS/__mocks__/ProductsApi';
export const Store = jest.fn(() => {
    return {
        Api: {
            Android: {
                Store: new AndroidStoreApi()
            },
            iOS: {
                Products: new ProductsApi(),
                AppSheet: new AppSheetApi()
            }
        },
        StoreManager: new StoreManager()
    };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU3RvcmUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvU3RvcmUvX19tb2Nrc19fL1N0b3JlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sZ0RBQWdELENBQUM7QUFDakYsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ3JFLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSx3Q0FBd0MsQ0FBQztBQUlyRSxNQUFNLENBQUMsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUU7SUFDOUIsT0FBZTtRQUNYLEdBQUcsRUFBRTtZQUNELE9BQU8sRUFBRTtnQkFDTCxLQUFLLEVBQUUsSUFBSSxlQUFlLEVBQUU7YUFDL0I7WUFDRCxHQUFHLEVBQUU7Z0JBQ0QsUUFBUSxFQUFFLElBQUksV0FBVyxFQUFFO2dCQUMzQixRQUFRLEVBQUUsSUFBSSxXQUFXLEVBQUU7YUFDOUI7U0FDSjtRQUNELFlBQVksRUFBRSxJQUFJLFlBQVksRUFBRTtLQUNuQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLENBQUMifQ==