import { Model } from 'Core/Models/Model';

interface IVastVerificationResource {
    resourceUrl: string;
    apiFramework: string;
    browserOptional: boolean | null;
    type: string;
}

export class VastVerificationResource extends Model<IVastVerificationResource> {

    constructor(resourceUrl: string, apiFramework: string, browserOptional?: boolean, type?: string) {
        super('VastVerificationResource', {
            resourceUrl: ['string'],
            apiFramework: ['string'],
            browserOptional: ['boolean', 'null'],
            type: ['string', 'null']
        });

        this.set('resourceUrl', resourceUrl);
        this.set('apiFramework', apiFramework);
        this.set('browserOptional', browserOptional || null);
        this.set('type', type || 'other');  // javascript and other
    }

    public getResourceUrl(): string {
        return this.get('resourceUrl');
    }

    public getApiFramework(): string {
        return this.get('apiFramework');
    }

    public getBrowserOptional(): boolean | null {
        return this.get('browserOptional');
    }

    public getType(): string {
        return this.get('type');
    }

    public getDTO(): { [key: string]: unknown } {
        return {
            'resourceUrl': this.getResourceUrl(),
            'apiFramework': this.getApiFramework(),
            'browserOptional': this.getBrowserOptional(),
            'type': this.getType()
        };
    }
}
