import { ABGroup } from 'Core/Models/ABGroup';
import { ISchema, Model } from 'Core/Models/Model';

export enum CacheMode {
    FORCED,
    ALLOWED,
    DISABLED,
    ADAPTIVE
}

export interface ICoreConfiguration {
    enabled: boolean;
    country: string;
    coppaCompliant: boolean;
    abGroup: ABGroup;
    properties: string;
    analytics: boolean;
    test: boolean;
    projectId: string;
    token: string;
    jaegerTracing: boolean;
    organizationId: string | undefined;
    developerId: number | undefined;
}

export class CoreConfiguration extends Model<ICoreConfiguration> {
    public static Schema: ISchema<ICoreConfiguration> = {
        enabled: ['boolean'],
        country: ['string'],
        coppaCompliant: ['boolean'],
        abGroup: ['number'],
        properties: ['string'],
        analytics: ['boolean'],
        test: ['boolean'],
        projectId: ['string'],
        token: ['string'],
        jaegerTracing: ['boolean'],
        organizationId: ['string', 'undefined'],
        developerId: ['number', 'undefined']
    };

    constructor(data: ICoreConfiguration) {
        super('Configuration', CoreConfiguration.Schema, data);
    }

    public isEnabled(): boolean {
        return this.get('enabled');
    }

    public getCountry(): string {
        return this.get('country');
    }

    public isCoppaCompliant(): boolean {
        return this.get('coppaCompliant');
    }

    public isAnalyticsEnabled(): boolean {
        return this.get('analytics');
    }

    public isJaegerTracingEnabled(): boolean {
        return this.get('jaegerTracing');
    }

    public getAbGroup(): ABGroup {
        return this.get('abGroup');
    }

    public getProperties(): string {
        return this.get('properties');
    }

    public getToken(): string {
        return this.get('token');
    }

    public getUnityProjectId(): string {
        return this.get('projectId');
    }

    public getTestMode(): boolean {
        return this.get('test');
    }

    public getOrganizationId(): string | undefined {
        return this.get('organizationId');
    }

    public getDeveloperId(): number | undefined {
        return this.get('developerId');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'enabled': this.isEnabled(),
            'country': this.getCountry(),
            'coppaCompliant': this.isCoppaCompliant(),
            'abGroup': this.getAbGroup(),
            'gamerToken': this.getToken(),
            'projectId': this.getUnityProjectId(),
            'testMode': this.getTestMode(),
            'organizationId': this.getOrganizationId(),
            'developerId': this.getDeveloperId()
        };
    }
}
