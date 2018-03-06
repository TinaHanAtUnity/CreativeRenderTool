import { Model } from 'Models/Model';

interface IAdMobOptionalSignal {
    sequenceNumber: number;
    granularSpeedBucket: string;
    isNetworkMetered: boolean;
    deviceSubModel: string;
    numPriorUserRequests: number;
    isDeviceCharging: boolean;
    deviceBatteryLevel: number;
    androidMarketVersion: number;
    adLoadDuration: number;
    priorClickCount: number;
    deviceIncapabilities: string;
    hasIAPCapability: boolean;
    latitude: number;
    longitude: number;
    locationRadius: number;
    iuSizes: string;
    adtest: boolean;
    isJailbroken: boolean;
    userGender: string;
    userAge: number;
}

export class AdMobOptionalSignal extends Model<IAdMobOptionalSignal> {
    constructor() {
        super('AdMobOptionalSignal', {
            sequenceNumber: ['number', 'undefined'],
            granularSpeedBucket: ['string', 'undefined'],
            isNetworkMetered: ['boolean', 'undefined'],
            deviceSubModel: ['string', 'undefined'],
            numPriorUserRequests: ['number', 'undefined'],
            isDeviceCharging: ['boolean', 'undefined'],
            deviceBatteryLevel: ['number', 'undefined'],
            androidMarketVersion: ['number', 'undefined'],
            adLoadDuration: ['number', 'undefined'],
            priorClickCount: ['number', 'undefined'],
            deviceIncapabilities: ['string', 'undefined'],
            hasIAPCapability: ['boolean', 'undefined'],
            latitude: ['number', 'undefined'],
            longitude: ['number', 'undefined'],
            locationRadius: ['number', 'undefined'],
            iuSizes: ['string', 'undefined'],
            adtest: ['boolean', 'undefined'],
            isJailbroken: ['boolean', 'undefined'],
            userGender: ['string', 'undefined'],
            userAge: ['number', 'undefined']
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
    public getAndroidMarketVersion(): number {
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
    public getLatitude(): number {
        return this.get('latitude');
    }
    public getLongitude(): number {
        return this.get('longitude');
    }
    public getLocationRadius(): number {
        return this.get('locationRadius');
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
    public getUserGender(): string {
        return this.get('userGender');
    }
    public getUserAge(): number {
        return this.get('userAge');
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
    public setAndroidMarketVersion(androidMarketVersion: number) {
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
    public setLatitude(latitude: number) {
        this.set('latitude', latitude);
    }
    public setLongitude(longitude: number) {
        this.set('longitude', longitude);
    }
    public setLocationRadius(locationRadius: number) {
        this.set('locationRadius', locationRadius);
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
    public setUserGender(userGender: string) {
        this.set('userGender', userGender);
    }
    public setUserAge(userAge: number) {
        this.set('userAge', userAge);
    }

    public getDTO() {
        return {
            seq_num: this.getSequenceNumber(),
            granular_speed_bucket: this.getGranularSpeedBucket(),
            network_metered: this.getIsNetworkMetered(),
            mobile_device_submodel: this.getDeviceSubModel(),
            prior_user_requests: this.getNumPriorUserRequests(),
            device_battery_charging: this.getIsDeviceCharging(),
            android_market_version: this.getAndroidMarketVersion(),
            ad_load_duration: this.getAdLoadDuration(),
            prior_click_count: this.getPriorClickCount(),
            device_incapabilities: this.getDeviceIncapabilities(),
            cap_noiap: this.getHasIAPCapability(),
            latitude: this.getLatitude(),
            longitude: this.getLongitude(),
            radius: this.getLocationRadius(),
            iu_sizes: this.getIUSizes(),
            user_gender: this.getUserGender(),
            user_age: this.getUserAge(),
            adtest: this.getAdtest(),
            ios_jailbroken: this.getIsJailbroken()
        };
    }
}
