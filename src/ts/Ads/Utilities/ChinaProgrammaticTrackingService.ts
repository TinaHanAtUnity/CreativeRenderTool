import { ProgrammaticTrackingService } from 'Ads/Utilities/ProgrammaticTrackingService';

export class ChinaProgrammaticTrackingService extends ProgrammaticTrackingService {
  protected getBaseUrl(): string {
    return 'https://sdk-diagnostics.prd.mz.internal.unity.cn/';
  }
}
