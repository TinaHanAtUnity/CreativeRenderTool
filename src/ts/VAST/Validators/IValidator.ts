import { CampaignError } from 'Ads/Errors/CampaignError';

export interface IValidator {

    getErrors(): CampaignError[];

}
