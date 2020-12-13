import { Model } from 'Core/Models/Model';
export var PlacementState;
(function (PlacementState) {
    PlacementState[PlacementState["READY"] = 0] = "READY";
    PlacementState[PlacementState["NOT_AVAILABLE"] = 1] = "NOT_AVAILABLE";
    PlacementState[PlacementState["DISABLED"] = 2] = "DISABLED";
    PlacementState[PlacementState["WAITING"] = 3] = "WAITING";
    PlacementState[PlacementState["NO_FILL"] = 4] = "NO_FILL";
})(PlacementState || (PlacementState = {}));
export const DefaultPlacementAuctionType = 'cpm';
export class Placement extends Model {
    constructor(data) {
        super('Placement', {
            id: ['string'],
            name: ['string'],
            default: ['boolean'],
            allowSkip: ['boolean'],
            skipInSeconds: ['number'],
            disableBackButton: ['boolean'],
            muteVideo: ['boolean'],
            skipEndCardOnClose: ['boolean', 'undefined'],
            disableVideoControlsFade: ['boolean', 'undefined'],
            useCloseIconInsteadOfSkipIcon: ['boolean', 'undefined'],
            adTypes: ['array', 'undefined'],
            state: ['number'],
            previousState: ['number'],
            placementStateChanged: ['boolean'],
            currentCampaign: ['object', 'undefined'],
            currentTrackingUrls: ['object', 'undefined'],
            refreshDelay: ['number', 'undefined'],
            position: ['string', 'undefined'],
            auctionType: ['string'],
            bannerRefreshRate: ['number', 'undefined'],
            adUnitId: ['string', 'undefined'],
            groupId: ['string', 'undefined'],
            invalidationPending: ['boolean']
        });
        this.set('id', data.id);
        this.set('name', data.name);
        this.set('default', data.default);
        const allowSkip = data.allowSkip;
        this.set('allowSkip', allowSkip);
        if (allowSkip) {
            this.set('skipInSeconds', data.skipInSeconds);
        }
        this.set('disableBackButton', data.disableBackButton);
        this.set('muteVideo', data.muteVideo);
        this.set('skipEndCardOnClose', data.skipEndCardOnClose);
        this.set('disableVideoControlsFade', data.disableVideoControlsFade);
        this.set('useCloseIconInsteadOfSkipIcon', data.useCloseIconInsteadOfSkipIcon);
        this.set('adTypes', data.adTypes);
        this.set('state', PlacementState.NOT_AVAILABLE);
        this.set('refreshDelay', data.refreshDelay);
        this.set('position', data.position || 'bottomcenter');
        this.set('auctionType', data.auctionType || DefaultPlacementAuctionType);
        if (data.banner) {
            this.set('bannerRefreshRate', data.banner.refreshRate);
        }
        this.set('adUnitId', data.adUnitId);
        this.set('groupId', data.groupId);
        this.set('invalidationPending', false);
    }
    getId() {
        return this.get('id');
    }
    getName() {
        return this.get('name');
    }
    isDefault() {
        return this.get('default');
    }
    allowSkip() {
        return this.get('allowSkip');
    }
    allowSkipInSeconds() {
        return this.get('skipInSeconds');
    }
    disableBackButton() {
        return this.get('disableBackButton');
    }
    muteVideo() {
        return this.get('muteVideo');
    }
    skipEndCardOnClose() {
        return this.get('skipEndCardOnClose');
    }
    disableVideoControlsFade() {
        return this.get('disableVideoControlsFade');
    }
    useCloseIconInsteadOfSkipIcon() {
        return this.get('useCloseIconInsteadOfSkipIcon');
    }
    getAdTypes() {
        return this.get('adTypes');
    }
    getState() {
        return this.get('state');
    }
    getAuctionType() {
        return this.get('auctionType');
    }
    setState(state) {
        if (this.getState() !== state) {
            this.set('previousState', this.getState());
            this.setPlacementStateChanged(true);
        }
        this.set('state', state);
    }
    getPlacementStateChanged() {
        return this.get('placementStateChanged');
    }
    setPlacementStateChanged(changed) {
        this.set('placementStateChanged', changed);
    }
    getPreviousState() {
        return this.get('previousState');
    }
    getCurrentCampaign() {
        return this.get('currentCampaign');
    }
    setCurrentCampaign(campaign) {
        this.set('currentCampaign', campaign);
    }
    getCurrentTrackingUrls() {
        return this.get('currentTrackingUrls');
    }
    setCurrentTrackingUrls(trackingUrls) {
        this.set('currentTrackingUrls', trackingUrls);
    }
    getRefreshDelay() {
        return this.get('refreshDelay');
    }
    getBannerRefreshRate() {
        return this.get('bannerRefreshRate');
    }
    getBannerStyle() {
        return this.get('position');
    }
    isBannerPlacement() {
        const adTypes = this.getAdTypes();
        if (adTypes) {
            for (const adType of adTypes) {
                if (adType === 'BANNER') {
                    return true;
                }
            }
        }
        return false;
    }
    isInvalidationPending() {
        return this.get('invalidationPending');
    }
    setInvalidationPending(value) {
        this.set('invalidationPending', value);
    }
    getAdUnitId() {
        return this.get('adUnitId');
    }
    hasAdUnitId() {
        if (this.getAdUnitId()) {
            return true;
        }
        return false;
    }
    getGroupId() {
        return this.get('groupId');
    }
    hasGroupId() {
        if (this.getGroupId()) {
            return true;
        }
        return false;
    }
    getDTO() {
        return {
            'id': this.getId(),
            'name': this.getName(),
            'default': this.isDefault(),
            'allowSkip': this.allowSkip(),
            'skipInSeconds': this.allowSkipInSeconds(),
            'disableBackButton': this.disableBackButton(),
            'muteVideo': this.muteVideo(),
            'skipEndCardOnClose': this.skipEndCardOnClose(),
            'disableVideoControlsFade': this.disableVideoControlsFade(),
            'useCloseIconInsteadOfSkipIcon': this.useCloseIconInsteadOfSkipIcon(),
            'adTypes': this.getAdTypes(),
            'adUnitId': this.getAdUnitId(),
            'groupId': this.getGroupId(),
            'state': PlacementState[this.getState()].toLowerCase()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxhY2VtZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9Nb2RlbHMvUGxhY2VtZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUUxQyxNQUFNLENBQU4sSUFBWSxjQU1YO0FBTkQsV0FBWSxjQUFjO0lBQ3RCLHFEQUFLLENBQUE7SUFDTCxxRUFBYSxDQUFBO0lBQ2IsMkRBQVEsQ0FBQTtJQUNSLHlEQUFPLENBQUE7SUFDUCx5REFBTyxDQUFBO0FBQ1gsQ0FBQyxFQU5XLGNBQWMsS0FBZCxjQUFjLFFBTXpCO0FBR0QsTUFBTSxDQUFDLE1BQU0sMkJBQTJCLEdBQUcsS0FBSyxDQUFDO0FBd0RqRCxNQUFNLE9BQU8sU0FBVSxTQUFRLEtBQWlCO0lBRTVDLFlBQVksSUFBbUI7UUFDM0IsS0FBSyxDQUFDLFdBQVcsRUFBRTtZQUNmLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNkLElBQUksRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUNoQixPQUFPLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDcEIsU0FBUyxFQUFFLENBQUMsU0FBUyxDQUFDO1lBQ3RCLGFBQWEsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUN6QixpQkFBaUIsRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUM5QixTQUFTLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDdEIsa0JBQWtCLEVBQUUsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDO1lBQzVDLHdCQUF3QixFQUFFLENBQUMsU0FBUyxFQUFFLFdBQVcsQ0FBQztZQUNsRCw2QkFBNkIsRUFBRSxDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUM7WUFDdkQsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQztZQUMvQixLQUFLLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDakIsYUFBYSxFQUFFLENBQUMsUUFBUSxDQUFD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