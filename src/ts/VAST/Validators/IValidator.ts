import { Warning } from 'Ads/Errors/Warning';

export interface IValidator {
    getErrors(): Error[];
    getWarnings(): Warning[];
}
