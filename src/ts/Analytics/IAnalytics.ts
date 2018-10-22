import { AnalyticsManager } from './AnalyticsManager';
import { IModuleApi } from '../Core/Modules/IApiModule';
import { AnalyticsApi } from './Native/Analytics';
import { AnalyticsStorage } from './AnalyticsStorage';

export interface IAnalyticsApi extends IModuleApi {
    Analytics: AnalyticsApi;
}

export interface IAnalytics {
    AnalyticsManager: AnalyticsManager;
    AnalyticsStorage: AnalyticsStorage;
}
