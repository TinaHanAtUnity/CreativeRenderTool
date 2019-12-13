import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
import { PrivacySDK } from 'Privacy/PrivacySDK';
import { ABGroup } from 'Core/Models/ABGroup';
import { IPrivacyPermissions } from 'Privacy/Privacy';

export enum PrivacyEvent {
    AGE_GATE_SHOW = 'age_gate_show',
    AGE_GATE_PASS = 'age_gate_pass',
    AGE_GATE_NOT_PASSED = 'age_gate_not_passed',
    CONSENT_SHOW = 'consent_show',
    CONSENT_ACCEPT_ALL = 'consent_accept_all',
    CONSENT_NOT_ACCEPTED = 'consent_not_accepted',
    CONSENT_PARTIALLY_ACCEPTED = 'consent_partially_accepted'
}

export enum CaptchaEvent {
    REQUEST_SCREEN_OPEN = 'captcha_screen_open',
    REQUEST_SCREEN_CLOSE = 'captcha_screen_close',
    REQUEST_CAPTCHA_PASS = 'captcha_pass',
    REQUEST_CAPTCHA_FAIL = 'captcha_fail',
    REQUEST_CAPTCHA_FAILED_MULTIPLE = 'captcha_fail_multiple_blocked',
    REQUEST_CAPTCHA_ERROR = 'captcha_error',
    REQUEST_CAPTCHA_MISSING_DATA = 'captcha_missing_data_error'
}

export class PrivacyMetrics {
    public static trigger(event: PrivacyEvent | CaptchaEvent, permissions?: IPrivacyPermissions) {
        const kafkaObject: { [key: string]: unknown } = {};

        kafkaObject.type = event;
        kafkaObject.timestamp = Date.now();

        if (PrivacyMetrics._gameSessionId) {
            kafkaObject.gameSessionId = PrivacyMetrics._gameSessionId;
        }

        if (PrivacyMetrics._privacy) {
            kafkaObject.ageGateLimit = PrivacyMetrics._privacy.getAgeGateLimit();
            kafkaObject.legalFramework = PrivacyMetrics._privacy.getLegalFramework();
        }

        if (PrivacyMetrics._abGroup) {
            kafkaObject.abGroup = PrivacyMetrics._abGroup.valueOf();
        }

        if (PrivacyMetrics._subdivision) {
            kafkaObject.subdivision = PrivacyMetrics._subdivision;
        }

        if (permissions) {
            kafkaObject.permissions = permissions;
        }
        HttpKafka.sendEvent('ads.sdk2.events.privacymetrics.json', KafkaCommonObjectType.ANONYMOUS, kafkaObject);
    }

    public static setGameSessionId(id: number) {
        PrivacyMetrics._gameSessionId = id;
    }

    public static setPrivacy(privacy: PrivacySDK) {
        PrivacyMetrics._privacy = privacy;
    }

    public static setAbGroup(group: ABGroup) {
        PrivacyMetrics._abGroup = group;
    }

    public static setSubdivision(subdivision: string) {
        PrivacyMetrics._subdivision = subdivision;
    }

    private static _gameSessionId: number | undefined;
    private static _privacy: PrivacySDK | undefined;
    private static _abGroup: ABGroup | undefined;
    private static _subdivision: string | undefined;
}
