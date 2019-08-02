import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';
import { IAnalyticsManager } from 'Analytics/IAnalyticsManager';

export interface IAnalyticsApi extends IModuleApi {
    Analytics: AnalyticsApi;
}
export interface IAnalytics extends IApiModule {
    AnalyticsManager: IAnalyticsManager;
    AnalyticsStorage: AnalyticsStorage;
}
