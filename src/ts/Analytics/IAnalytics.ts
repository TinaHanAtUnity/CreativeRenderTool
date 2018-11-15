import { AnalyticsManager } from 'Analytics/AnalyticsManager';
import { AnalyticsStorage } from 'Analytics/AnalyticsStorage';
import { AnalyticsApi } from 'Analytics/Native/Analytics';
import { IApiModule, IModuleApi } from 'Core/Modules/IApiModule';

export interface IAnalyticsApi extends IModuleApi {
    Analytics: AnalyticsApi;
}

export interface IAnalytics extends IApiModule {
    AnalyticsManager: AnalyticsManager;
    AnalyticsStorage: AnalyticsStorage;
}
