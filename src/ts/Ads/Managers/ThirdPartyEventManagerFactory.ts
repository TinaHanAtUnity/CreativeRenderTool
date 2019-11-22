import { ITemplateValueMap, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';

export interface IThirdPartyEventManagerFactory {
    create(templateValues: ITemplateValueMap): ThirdPartyEventManager;
}

export class ThirdPartyEventManagerFactory implements IThirdPartyEventManagerFactory {

    private _core: ICoreApi;
    private _requestManager: RequestManager;

    constructor(core: ICoreApi, requestManager: RequestManager) {
        this._core = core;
        this._requestManager = requestManager;
    }

    public create(templateValues: ITemplateValueMap): ThirdPartyEventManager {
        return new ThirdPartyEventManager(this._core, this._requestManager, templateValues);
    }
}
