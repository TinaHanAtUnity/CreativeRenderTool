import { ITemplateValueMap, ThirdPartyEventManager } from 'Ads/Managers/ThirdPartyEventManager';
import { ICoreApi } from 'Core/ICore';
import { RequestManager } from 'Core/Managers/RequestManager';
import { StorageBridge } from 'Core/Utilities/StorageBridge';

export interface IThirdPartyEventManagerFactory {
    create(templateValues: ITemplateValueMap): ThirdPartyEventManager;
}

export class ThirdPartyEventManagerFactory implements IThirdPartyEventManagerFactory {

    private _core: ICoreApi;
    private _requestManager: RequestManager;
    private _storageBridge: StorageBridge;

    constructor(core: ICoreApi, requestManager: RequestManager, storageBridge: StorageBridge) {
        this._core = core;
        this._requestManager = requestManager;
        this._storageBridge = storageBridge;
    }

    public create(templateValues: ITemplateValueMap): ThirdPartyEventManager {
        return new ThirdPartyEventManager(this._core, this._requestManager, templateValues, this._storageBridge);
    }
}
