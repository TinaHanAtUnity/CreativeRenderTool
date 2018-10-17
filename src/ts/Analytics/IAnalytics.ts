import { AnalyticsManager } from './AnalyticsManager';
import { IModuleApi } from '../Core/Modules/IApiModule';
import { AnalyticsApi } from './Native/Analytics';

export interface IAnalyticsApi extends IModuleApi {
    Analytics: AnalyticsApi;
}

export interface IAnalytics {
    AnalyticsManager: AnalyticsManager;
}
