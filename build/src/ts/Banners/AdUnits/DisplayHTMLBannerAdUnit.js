import { Platform } from 'Core/Constants/Platform';
import { Template } from 'Core/Utilities/Template';
import { HTMLBannerAdUnit } from 'Banners/AdUnits/HTMLBannerAdUnit';
import BannerContainer from 'html/banner/BannerContainer.html';
export class DisplayHTMLBannerAdUnit extends HTMLBannerAdUnit {
    constructor(parameters) {
        super(parameters);
        this._template = new Template(BannerContainer);
    }
    onDestroy() {
        this._webPlayerContainer.shouldOverrideUrlLoading.unsubscribe(this._urlLoadingObserver);
        this._webPlayerContainer.onCreateWebView.unsubscribe(this._onCreateWebViewObserver);
        return super.onDestroy();
    }
    onDomContentLoaded() {
        if (this._platform === Platform.ANDROID) {
            this._urlLoadingObserver = this._webPlayerContainer.shouldOverrideUrlLoading.subscribe((url) => {
                this.onOpenURL(url);
            });
        }
        else {
            this._onCreateWebViewObserver = this._webPlayerContainer.onCreateWebView.subscribe((url) => {
                this.onOpenURL(url);
            });
        }
        const eventSettings = this.getEventSettings();
        return super.setEventSettings(eventSettings);
    }
    getMarkup() {
        return Promise.resolve(decodeURIComponent(this._campaign.getMarkup()));
    }
    getEventSettings() {
        if (this._platform === Platform.ANDROID) {
            return {
                shouldOverrideUrlLoading: {
                    sendEvent: true,
                    returnValue: true
                },
                onReceivedSslError: { shouldCallSuper: true }
            };
        }
        else {
            return {
                onCreateWindow: {
                    sendEvent: true
                },
                onReceivedSslError: { shouldCallSuper: true }
            };
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRGlzcGxheUhUTUxCYW5uZXJBZFVuaXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvQmFubmVycy9BZFVuaXRzL0Rpc3BsYXlIVE1MQmFubmVyQWRVbml0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUVuRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGdCQUFnQixFQUEyQixNQUFNLGtDQUFrQyxDQUFDO0FBQzdGLE9BQU8sZUFBZSxNQUFNLGtDQUFrQyxDQUFDO0FBRS9ELE1BQU0sT0FBTyx1QkFBd0IsU0FBUSxnQkFBZ0I7SUFLekQsWUFBWSxVQUFtQztRQUMzQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sU0FBUztRQUNaLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyx3QkFBd0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLENBQUM7UUFDeEYsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLENBQUM7UUFDcEYsT0FBTyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVTLGtCQUFrQjtRQUN4QixJQUFJLElBQUksQ0FBQyxTQUFTLEtBQUssUUFBUSxDQUFDLE9BQU8sRUFBRTtZQUNyQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLHdCQUF3QixDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMzRixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1NBQ047YUFBTTtZQUNILElBQUksQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUN2RixJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ3hCLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUM5QyxPQUFPLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBRVMsU0FBUztRQUNmLE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUMzRSxDQUFDO0lBRU8sZ0JBQWdCO1FBQ3BCLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxRQUFRLENBQUMsT0FBTyxFQUFFO1lBQ3JDLE9BQU87Z0JBQ0gsd0JBQXdCLEVBQUU7b0JBQ3RCLFNBQVMsRUFBRSxJQUFJO29CQUNmLFdBQVcsRUFBRSxJQUFJO2lCQUNwQjtnQkFDRCxrQkFBa0IsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUU7YUFDaEQsQ0FBQztTQUNMO2FBQU07WUFDSCxPQUFPO2dCQUNILGNBQWMsRUFBRTtvQkFDWixTQUFTLEVBQUUsSUFBSTtpQkFDbEI7Z0JBQ0Qsa0JBQWtCLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFFO2FBQ2hELENBQUM7U0FDTDtJQUNMLENBQUM7Q0FDSiJ9