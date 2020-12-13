import { AbstractAdUnit } from 'Ads/AdUnits/AbstractAdUnit';
import { View } from 'Core/Views/View';
export class VastEndScreen extends View {
    constructor(parameters, attachTap) {
        super(parameters.platform, 'vast-end-screen', attachTap);
        this._isSwipeToCloseEnabled = false;
        this._hidePrivacy = false;
        this._callButtonEnabled = true;
        this._campaign = parameters.campaign;
        this._country = parameters.coreConfig.getCountry();
        this._hidePrivacy = parameters.adsConfig.getHidePrivacy() || false;
    }
    render() {
        super.render();
        const chinaAdvertisementElement = this._container.querySelector('.china-advertisement');
        if (this._country === 'CN' && chinaAdvertisementElement) {
            chinaAdvertisementElement.style.display = 'block';
        }
        if (this._isSwipeToCloseEnabled) {
            this._container.querySelector('.btn-close-region').style.display = 'none';
        }
        // hide privacy icon for China
        if (this._hidePrivacy) {
            this._container.classList.add('hidePrivacyButton');
        }
    }
    show() {
        super.show();
        this._handlers.forEach(handler => handler.onVastEndScreenShow());
        if (AbstractAdUnit.getAutoClose()) {
            setTimeout(() => {
                this._handlers.forEach(handler => handler.onVastEndScreenClose());
            }, AbstractAdUnit.getAutoCloseDelay());
        }
    }
    remove() {
        const container = this.container();
        if (container && container.parentElement) {
            container.parentElement.removeChild(this.container());
        }
    }
    setCallButtonEnabled(value) {
        if (this._callButtonEnabled !== value) {
            this._callButtonEnabled = value;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmFzdEVuZFNjcmVlbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9WQVNUL1ZpZXdzL1Zhc3RFbmRTY3JlZW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGNBQWMsRUFBcUIsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRSxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFVdkMsTUFBTSxPQUFPLGFBQWMsU0FBUSxJQUEyQjtJQVExRCxZQUFZLFVBQTJDLEVBQUUsU0FBK0I7UUFDcEYsS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFQbkQsMkJBQXNCLEdBQVksS0FBSyxDQUFDO1FBR3hDLGlCQUFZLEdBQVksS0FBSyxDQUFDO1FBQzlCLHVCQUFrQixHQUFZLElBQUksQ0FBQztRQUt6QyxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUM7UUFDckMsSUFBSSxDQUFDLFFBQVEsR0FBRyxVQUFVLENBQUMsVUFBVSxDQUFDLFVBQVUsRUFBRSxDQUFDO1FBQ25ELElBQUksQ0FBQyxZQUFZLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxLQUFLLENBQUM7SUFDdkUsQ0FBQztJQUVNLE1BQU07UUFDVCxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUM7UUFFZixNQUFNLHlCQUF5QixHQUF1QixJQUFJLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzVHLElBQUksSUFBSSxDQUFDLFFBQVEsS0FBSyxJQUFJLElBQUkseUJBQXlCLEVBQUU7WUFDckQseUJBQXlCLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7U0FDckQ7UUFFRCxJQUFJLElBQUksQ0FBQyxzQkFBc0IsRUFBRTtZQUNkLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7U0FDN0Y7UUFFRCw4QkFBOEI7UUFDOUIsSUFBSSxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ25CLElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQ3REO0lBQ0wsQ0FBQztJQUVNLElBQUk7UUFDUCxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFYixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxtQkFBbUIsRUFBRSxDQUFDLENBQUM7UUFFakUsSUFBSSxjQUFjLENBQUMsWUFBWSxFQUFFLEVBQUU7WUFDL0IsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxvQkFBb0IsRUFBRSxDQUFDLENBQUM7WUFDdEUsQ0FBQyxFQUFFLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUM7U0FDMUM7SUFDTCxDQUFDO0lBRU0sTUFBTTtRQUNULE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUNuQyxJQUFJLFNBQVMsSUFBSSxTQUFTLENBQUMsYUFBYSxFQUFFO1lBQ3RDLFNBQVMsQ0FBQyxhQUFhLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1NBQ3pEO0lBQ0wsQ0FBQztJQUVNLG9CQUFvQixDQUFDLEtBQWM7UUFDdEMsSUFBSSxJQUFJLENBQUMsa0JBQWtCLEtBQUssS0FBSyxFQUFFO1lBQ25DLElBQUksQ0FBQyxrQkFBa0IsR0FBRyxLQUFLLENBQUM7U0FDbkM7SUFDTCxDQUFDO0NBRUoifQ==