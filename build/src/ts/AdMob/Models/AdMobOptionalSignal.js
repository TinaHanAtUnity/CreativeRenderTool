import { Model } from 'Core/Models/Model';
export class AdMobOptionalSignal extends Model {
    constructor() {
        super('AdMobOptionalSignal', {
            sequenceNumber: ['number'],
            granularSpeedBucket: ['string'],
            isNetworkMetered: ['boolean'],
            deviceSubModel: ['string'],
            numPriorUserRequests: ['number'],
            isDeviceCharging: ['boolean'],
            deviceBatteryLevel: ['number'],
            androidMarketVersion: ['string'],
            adLoadDuration: ['number'],
            priorClickCount: ['number'],
            deviceIncapabilities: ['string'],
            hasIAPCapability: ['boolean'],
            iuSizes: ['string'],
            adtest: ['boolean'],
            isJailbroken: ['boolean'],
            sdk_apis: ['string'],
            omid_p: ['string']
        });
    }
    getSequenceNumber() {
        return this.get('sequenceNumber');
    }
    getGranularSpeedBucket() {
        return this.get('granularSpeedBucket');
    }
    getIsNetworkMetered() {
        return this.get('isNetworkMetered');
    }
    getDeviceSubModel() {
        return this.get('deviceSubModel');
    }
    getNumPriorUserRequests() {
        return this.get('numPriorUserRequests');
    }
    getIsDeviceCharging() {
        return this.get('isDeviceCharging');
    }
    getDeviceBatteryLevel() {
        return this.get('deviceBatteryLevel');
    }
    getAndroidMarketVersion() {
        return this.get('androidMarketVersion');
    }
    getAdLoadDuration() {
        return this.get('adLoadDuration');
    }
    getPriorClickCount() {
        return this.get('priorClickCount');
    }
    getDeviceIncapabilities() {
        return this.get('deviceIncapabilities');
    }
    getHasIAPCapability() {
        return this.get('hasIAPCapability');
    }
    getAdtest() {
        return this.get('adtest');
    }
    getIsJailbroken() {
        return this.get('isJailbroken');
    }
    getIUSizes() {
        return this.get('iuSizes');
    }
    getSDKApis() {
        return this.get('sdk_apis');
    }
    getOMIDP() {
        return this.get('omid_p');
    }
    setSequenceNumber(sequenceNumber) {
        this.set('sequenceNumber', sequenceNumber);
    }
    setGranularSpeedBucket(granularSpeedBucket) {
        this.set('granularSpeedBucket', granularSpeedBucket);
    }
    setIsNetworkMetered(isNetworkMetered) {
        this.set('isNetworkMetered', isNetworkMetered);
    }
    setDeviceSubModel(deviceSubModel) {
        this.set('deviceSubModel', deviceSubModel);
    }
    setNumPriorUserRequests(numPriorUserRequests) {
        this.set('numPriorUserRequests', numPriorUserRequests);
    }
    setIsDeviceCharging(isDeviceCharging) {
        this.set('isDeviceCharging', isDeviceCharging);
    }
    setDeviceBatteryLevel(deviceBatteryLevel) {
        this.set('deviceBatteryLevel', deviceBatteryLevel);
    }
    setAndroidMarketVersion(androidMarketVersion) {
        this.set('androidMarketVersion', androidMarketVersion);
    }
    setAdLoadDuration(adLoadDuration) {
        this.set('adLoadDuration', adLoadDuration);
    }
    setPriorClickCount(priorClickCount) {
        this.set('priorClickCount', priorClickCount);
    }
    setDeviceIncapabilities(deviceIncapabilities) {
        this.set('deviceIncapabilities', deviceIncapabilities);
    }
    setHasIAPCapability(hasIAPCapability) {
        this.set('hasIAPCapability', hasIAPCapability);
    }
    setAdtest(adtest) {
        this.set('adtest', adtest);
    }
    setIsJailbroken(isJailbroken) {
        this.set('isJailbroken', isJailbroken);
    }
    setIUSizes(iuSizes) {
        this.set('iuSizes', iuSizes);
    }
    setSDKApis(sdk_apis) {
        this.set('sdk_apis', sdk_apis);
    }
    setOMIDP(omid_p) {
        this.set('omid_p', omid_p);
    }
    getDTO() {
        return {
            seq_num: this.getSequenceNumber(),
            granular_speed_bucket: this.getGranularSpeedBucket(),
            network_metered: this.getIsNetworkMetered(),
            mobile_device_submodel: this.getDeviceSubModel(),
            prior_user_requests: this.getNumPriorUserRequests(),
            device_battery_charging: this.getIsDeviceCharging(),
            device_battery_level: this.getDeviceBatteryLevel(),
            android_market_version: this.getAndroidMarketVersion(),
            prior_click_count: this.getPriorClickCount(),
            device_incapabilities: this.getDeviceIncapabilities(),
            ios_jailbroken: this.getIsJailbroken(),
            iu_sizes: this.getIUSizes(),
            ad_load_duration: this.getAdLoadDuration()
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWRNb2JPcHRpb25hbFNpZ25hbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZE1vYi9Nb2RlbHMvQWRNb2JPcHRpb25hbFNpZ25hbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFzQjFDLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxLQUEyQjtJQUNoRTtRQUNJLEtBQUssQ0FBQyxxQkFBcUIsRUFBRTtZQUN6QixjQUFjLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDMUIsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDL0IsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDN0IsY0FBYyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzFCLG9CQUFvQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2hDLGdCQUFnQixFQUFFLENBQUMsU0FBUyxDQUFDO1lBQzdCLGtCQUFrQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQzlCLG9CQUFvQixFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ2hDLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQztZQUMxQixlQUFlLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDM0Isb0JBQW9CLEVBQUUsQ0FBQyxRQUFRLENBQUM7WUFDaEMsZ0JBQWdCLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDN0IsT0FBTyxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ25CLE1BQU0sRUFBRSxDQUFDLFNBQVMsQ0FBQztZQUNuQixZQUFZLEVBQUUsQ0FBQyxTQUFTLENBQUM7WUFDekIsUUFBUSxFQUFFLENBQUMsUUFBUSxDQUFDO1lBQ3BCLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQztTQUNyQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ00saUJBQWlCO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3RD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