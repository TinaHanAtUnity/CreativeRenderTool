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
    REQUEST_SCREEN_SHOW = 'captcha_screen_show',
    REQUEST_SCREEN_CLOSE = 'captcha_screen_close',
    REQUEST_CAPTCHA_PASS = 'captcha_pass',
    REQUEST_CAPTCHA_FAIL = 'captcha_fail',
    REQUEST_CAPTCHA_BLOCKED = 'captcha_blocked',
    REQUEST_CAPTCHA_ERROR_INIT = 'captcha_error_init',
    REQUEST_CAPTCHA_ERROR_INIT_MISSING_DATA = 'captcha_error_init_missing_data',
    REQUEST_CAPTCHA_FAIL_LIMIT = 'captcha_fail_limit',
    REQUEST_CAPTCHA_ERROR_VERIFY = 'captcha_error_verify',
    REQUEST_CAPTCHA_ERROR_VERIFY_MISSING_DATA = 'captcha_error_verify_missing_data'
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
