import { HttpKafka, KafkaCommonObjectType } from 'Core/Utilities/HttpKafka';
export var PrivacyEvent;
(function (PrivacyEvent) {
    PrivacyEvent["AGE_GATE_SHOW"] = "age_gate_show";
    PrivacyEvent["AGE_GATE_PASS"] = "age_gate_pass";
    PrivacyEvent["AGE_GATE_NOT_PASSED"] = "age_gate_not_passed";
    PrivacyEvent["CONSENT_SHOW"] = "consent_show";
    PrivacyEvent["CONSENT_ACCEPT_ALL"] = "consent_accept_all";
    PrivacyEvent["CONSENT_NOT_ACCEPTED"] = "consent_not_accepted";
    PrivacyEvent["CONSENT_PARTIALLY_ACCEPTED"] = "consent_partially_accepted";
})(PrivacyEvent || (PrivacyEvent = {}));
export var CaptchaEvent;
(function (CaptchaEvent) {
    CaptchaEvent["REQUEST_SCREEN_SHOW"] = "captcha_screen_show";
    CaptchaEvent["REQUEST_SCREEN_CLOSE"] = "captcha_screen_close";
    CaptchaEvent["REQUEST_CAPTCHA_PASS"] = "captcha_pass";
    CaptchaEvent["REQUEST_CAPTCHA_FAIL"] = "captcha_fail";
    CaptchaEvent["REQUEST_CAPTCHA_BLOCKED"] = "captcha_blocked";
    CaptchaEvent["REQUEST_CAPTCHA_ERROR_INIT"] = "captcha_error_init";
    CaptchaEvent["REQUEST_CAPTCHA_ERROR_INIT_MISSING_DATA"] = "captcha_error_init_missing_data";
    CaptchaEvent["REQUEST_CAPTCHA_FAIL_LIMIT"] = "captcha_fail_limit";
    CaptchaEvent["REQUEST_CAPTCHA_ERROR_VERIFY"] = "captcha_error_verify";
    CaptchaEvent["REQUEST_CAPTCHA_ERROR_VERIFY_MISSING_DATA"] = "captcha_error_verify_missing_data";
})(CaptchaEvent || (CaptchaEvent = {}));
export class PrivacyMetrics {
    static trigger(event, permissions) {
        const kafkaObject = {};
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
    static setGameSessionId(id) {
        PrivacyMetrics._gameSessionId = id;
    }
    static setPrivacy(privacy) {
        PrivacyMetrics._privacy = privacy;
    }
    static setAbGroup(group) {
        PrivacyMetrics._abGroup = group;
    }
    static setSubdivision(subdivision) {
        PrivacyMetrics._subdivision = subdivision;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeU1ldHJpY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdHMvUHJpdmFjeS9Qcml2YWN5TWV0cmljcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sMEJBQTBCLENBQUM7QUFLNUUsTUFBTSxDQUFOLElBQVksWUFRWDtBQVJELFdBQVksWUFBWTtJQUNwQiwrQ0FBK0IsQ0FBQTtJQUMvQiwrQ0FBK0IsQ0FBQTtJQUMvQiwyREFBMkMsQ0FBQTtJQUMzQyw2Q0FBNkIsQ0FBQTtJQUM3Qix5REFBeUMsQ0FBQTtJQUN6Qyw2REFBNkMsQ0FBQTtJQUM3Qyx5RUFBeUQsQ0FBQTtBQUM3RCxDQUFDLEVBUlcsWUFBWSxLQUFaLFlBQVksUUFRdkI7QUFFRCxNQUFNLENBQU4sSUFBWSxZQVdYO0FBWEQsV0FBWSxZQUFZO0lBQ3BCLDJEQUEyQyxDQUFBO0lBQzNDLDZEQUE2QyxDQUFBO0lBQzdDLHFEQUFxQyxDQUFBO0lBQ3JDLHFEQUFxQyxDQUFBO0lBQ3JDLDJEQUEyQyxDQUFBO0lBQzNDLGlFQUFpRCxDQUFBO0lBQ2pELDJGQUEyRSxDQUFBO0lBQzNFLGlFQUFpRCxDQUFBO0lBQ2pELHFFQUFxRCxDQUFBO0lBQ3JELCtGQUErRSxDQUFBO0FBQ25GLENBQUMsRUFYVyxZQUFZLEtBQVosWUFBWSxRQVd2QjtBQUVELE1BQU0sT0FBTyxjQUFjO0lBQ2hCLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBa0MsRUFBRSxXQUFpQztRQUN2RixNQUFNLFdBQVcsR0FBK0IsRUFBRSxDQUFDO1FBRW5ELFdBQVcsQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1FBQ3pCLFdBQVcsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBRW5DLElBQUksY0FBYyxDQUFDLGNBQWMsRUFBRTtZQUMvQixXQUFXLENBQUMsYUFBYSxHQUFHLGNBQWMsQ0FBQyxjQUFjLENBQUM7U0FDN0Q7UUFFRCxJQUFJLGNBQWMsQ0FBQyxRQUFRLEVBQUU7WUFDekIsV0FBVyxDQUFDLFlBQVksR0FBRyxjQUFjLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxDQUFDO1lBQ3JFLFdBQVcsQ0FBQyxjQUFjLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzVFO1FBRUQsSUFBSSxjQUFjLENBQUMsUUFBUSxFQUFFO1lBQ3pCLFdBQVcsQ0FBQyxPQUFPLEdBQUcsY0FBYyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUMzRDtRQUVELElBQUksY0FBYyxDQUFDLFlBQVksRUFBRTtZQUM3QixXQUFXLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxZQUFZLENBQUM7U0FDekQ7UUFFRCxJQUFJLFdBQVcsRUFBRTtZQUNiLFdBQVcsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1NBQ3pDO1FBQ0QsU0FBUyxDQUFDLFNBQVMsQ0FBQyxxQ0FBcUMsRUFBRSxxQkFBcUIsQ0FBQyxTQUFTLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUVNLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFVO1FBQ3JDLGNBQWMsQ0FBQyxjQUFjLEdBQUcsRUFBRSxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQW1CO1FBQ3hDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxNQUFNLENBQUMsVUFBVSxDQUFDLEtBQWM7UUFDbkMsY0FBYyxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7SUFDcEMsQ0FBQztJQUVNLE1BQU0sQ0FBQyxjQUFjLENBQUMsV0FBbUI7UUFDNUMsY0FBYyxDQUFDLFlBQVksR0FBRyxXQUFXLENBQUM7SUFDOUMsQ0FBQztDQU1KIn0=