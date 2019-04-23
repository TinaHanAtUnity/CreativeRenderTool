import { Model } from 'Core/Models/Model';

interface IAdMobOptionalSignal {
    sequenceNumber: number;
    granularSpeedBucket: string;
    isNetworkMetered: boolean;
    deviceSubModel: string;
    numPriorUserRequests: number;
    isDeviceCharging: boolean;
    deviceBatteryLevel: number;
    androidMarketVersion: string;
    adLoadDuration: number;
    priorClickCount: number;
    deviceIncapabilities: string;
    hasIAPCapability: boolean;
    iuSizes: string;
    adtest: boolean;
    isJailbroken: boolean;
    sdk_apis: string;
    omid_p: string;
}

export class AdMobOptionalSignal extends Model<IAdMobOptionalSignal> {
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
    public getSequenceNumber(): number {
        return this.get('sequenceNumber');
    }
    public getGranularSpeedBucket(): string {
        return this.get('granularSpeedBucket');
    }
    public getIsNetworkMetered(): boolean {
        return this.get('isNetworkMetered');
    }
    public getDeviceSubModel(): string {
        return this.get('deviceSubModel');
    }
    public getNumPriorUserRequests(): number {
        return this.get('numPriorUserRequests');
    }
    public getIsDeviceCharging(): boolean {
        return this.get('isDeviceCharging');
    }
    public getDeviceBatteryLevel(): number {
        return this.get('deviceBatteryLevel');
    }
    public getAndroidMarketVersion(): string {
        return this.get('androidMarketVersion');
    }
    public getAdLoadDuration(): number {
        return this.get('adLoadDuration');
    }
    public getPriorClickCount(): number {
        return this.get('priorClickCount');
    }
    public getDeviceIncapabilities(): string {
        return this.get('deviceIncapabilities');
    }
    public getHasIAPCapability(): boolean {
        return this.get('hasIAPCapability');
    }
    public getAdtest(): boolean {
        return this.get('adtest');
    }
    public getIsJailbroken(): boolean {
        return this.get('isJailbroken');
    }
    public getIUSizes(): string {
        return this.get('iuSizes');
    }
    public getSDKApis(): string {
        return this.get('sdk_apis');
    }
    public getOMIDP(): string {
        return this.get('omid_p');
    }
    public setSequenceNumber(sequenceNumber: number) {
        this.set('sequenceNumber', sequenceNumber);
    }
    public setGranularSpeedBucket(granularSpeedBucket: string) {
        this.set('granularSpeedBucket', granularSpeedBucket);
    }
    public setIsNetworkMetered(isNetworkMetered: boolean) {
        this.set('isNetworkMetered', isNetworkMetered);
    }
    public setDeviceSubModel(deviceSubModel: string) {
        this.set('deviceSubModel', deviceSubModel);
    }
    public setNumPriorUserRequests(numPriorUserRequests: number) {
        this.set('numPriorUserRequests', numPriorUserRequests);
    }
    public setIsDeviceCharging(isDeviceCharging: boolean) {
        this.set('isDeviceCharging', isDeviceCharging);
    }
    public setDeviceBatteryLevel(deviceBatteryLevel: number) {
        this.set('deviceBatteryLevel', deviceBatteryLevel);
    }
    public setAndroidMarketVersion(androidMarketVersion: string) {
        this.set('androidMarketVersion', androidMarketVersion);
    }
    public setAdLoadDuration(adLoadDuration: number) {
        this.set('adLoadDuration', adLoadDuration);
    }
    public setPriorClickCount(priorClickCount: number) {
        this.set('priorClickCount', priorClickCount);
    }
    public setDeviceIncapabilities(deviceIncapabilities: string) {
        this.set('deviceIncapabilities', deviceIncapabilities);
    }
    public setHasIAPCapability(hasIAPCapability: boolean) {
        this.set('hasIAPCapability', hasIAPCapability);
    }
    public setAdtest(adtest: boolean) {
        this.set('adtest', adtest);
    }
    public setIsJailbroken(isJailbroken: boolean) {
        this.set('isJailbroken', isJailbroken);
    }
    public setIUSizes(iuSizes: string) {
        this.set('iuSizes', iuSizes);
    }
    public setSDKApis(sdk_apis: string) {
        this.set('sdk_apis', sdk_apis);
    }
    public setOMIDP(omid_p: string) {
        this.set('omid_p', omid_p);
    }

    public getDTO() {
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
