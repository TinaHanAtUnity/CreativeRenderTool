import { Model } from 'Core/Models/Model';
export var PrivacyMethod;
(function (PrivacyMethod) {
    PrivacyMethod["DEFAULT"] = "default";
    PrivacyMethod["LEGITIMATE_INTEREST"] = "legitimate_interest";
    PrivacyMethod["UNITY_CONSENT"] = "unity_consent";
    PrivacyMethod["DEVELOPER_CONSENT"] = "developer_consent";
})(PrivacyMethod || (PrivacyMethod = {}));
export function isPrivacyPermissions(permissions) {
    return (permissions.gameExp !== undefined &&
        permissions.ads !== undefined &&
        permissions.external !== undefined);
}
export const CurrentUnityConsentVersion = 20181106;
export class GamePrivacy extends Model {
    constructor(data) {
        super('GamePrivacy', {
            method: ['string']
        });
        this.set('method', data.method);
    }
    getMethod() {
        return this.get('method');
    }
    setMethod(method) {
        this.set('method', method);
    }
    getVersion() {
        if (this.getMethod() === PrivacyMethod.UNITY_CONSENT) {
            return CurrentUnityConsentVersion;
        }
        return 0;
    }
    getDTO() {
        return {
            'method': this.getMethod(),
            'version': this.getVersion()
        };
    }
}
export class UserPrivacy extends Model {
    constructor(data) {
        super('UserPrivacy', {
            method: ['string'],
            version: ['number'],
            permissions: ['object']
        });
        this.set('method', data.method);
        this.set('version', data.version);
        this.set('permissions', {
            ads: data.permissions.ads,
            external: data.permissions.external,
            gameExp: data.permissions.gameExp
        });
    }
    static createFromLegacy(method, optOutRecorded, optOutEnabled) {
        if (!optOutRecorded) {
            return this.createUnrecorded();
        }
        switch (method) {
            case PrivacyMethod.DEVELOPER_CONSENT:
            case PrivacyMethod.LEGITIMATE_INTEREST:
                // it's unknown if user actually gave a consent (i.e. was game using developer_consent during that session)
                // or an opt-out therefore the optOutEnabled value is ambiguous. Therefore `external` can't be set to !optOutEnabled.
                return new UserPrivacy({
                    method: method,
                    version: 0,
                    permissions: {
                        gameExp: false,
                        ads: !optOutEnabled,
                        external: false
                    }
                });
            default:
                throw new Error('Unsupported privacy method');
        }
    }
    static createUnrecorded() {
        return new UserPrivacy({
            method: PrivacyMethod.DEFAULT,
            version: 0,
            permissions: this.PERM_ALL_FALSE
        });
    }
    static permissionsEql(permissions1, permissions2) {
        const properties = ['ads', 'external', 'gameExp'];
        for (const property of properties) {
            if (permissions1[property] !== permissions2[property]) {
                return false;
            }
        }
        return true;
    }
    isRecorded() {
        if (!this.getMethod()) {
            return false;
        }
        return this.getMethod() !== PrivacyMethod.DEFAULT;
    }
    getMethod() {
        return this.get('method');
    }
    setMethod(method) {
        this.set('method', method);
    }
    getVersion() {
        return this.get('version');
    }
    getPermissions() {
        return this.get('permissions');
    }
    setPermissions(permissions) {
        const thesePermissions = this.get('permissions');
        thesePermissions.ads = permissions.ads;
        thesePermissions.external = permissions.external;
        thesePermissions.gameExp = permissions.gameExp;
    }
    update(data) {
        this.set('method', data.method);
        this.set('version', data.version);
        this.setPermissions(data.permissions);
    }
    getDTO() {
        return {
            'method': this.getMethod(),
            'version': this.getVersion(),
            'permissions': this.getPermissions()
        };
    }
}
UserPrivacy.PERM_ALL_TRUE = Object.freeze({ ads: true, external: true, gameExp: true });
UserPrivacy.PERM_ALL_FALSE = Object.freeze({ ads: false, external: false, gameExp: false });
UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST = Object.freeze({ ads: true, external: true, gameExp: true });
UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST = Object.freeze({ ads: true, external: true, gameExp: true });
UserPrivacy.PERM_SKIPPED_LEGITIMATE_INTEREST_GDPR = Object.freeze({ ads: true, external: false, gameExp: true });
UserPrivacy.PERM_OPTIN_LEGITIMATE_INTEREST_GDPR = Object.freeze({ ads: true, external: false, gameExp: true });
UserPrivacy.PERM_DEVELOPER_CONSENTED = Object.freeze({ ads: true, external: true, gameExp: true });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9Qcml2YWN5L1ByaXZhY3kudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLEtBQUssRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRTFDLE1BQU0sQ0FBTixJQUFZLGFBS1g7QUFMRCxXQUFZLGFBQWE7SUFDckIsb0NBQW1CLENBQUE7SUFDbkIsNERBQTJDLENBQUE7SUFDM0MsZ0RBQStCLENBQUE7SUFDL0Isd0RBQXVDLENBQUE7QUFDM0MsQ0FBQyxFQUxXLGFBQWEsS0FBYixhQUFhLFFBS3hCO0FBYUQsTUFBTSxVQUFVLG9CQUFvQixDQUFDLFdBQWdDO0lBQ2pFLE9BQU8sQ0FBQyxXQUFXLENBQUMsT0FBTyxLQUFLLFNBQVM7UUFDckMsV0FBVyxDQUFDLEdBQUcsS0FBSyxTQUFTO1FBQzdCLFdBQVcsQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLENBQUM7QUFDNUMsQ0FBQztBQU1ELE1BQU0sQ0FBQyxNQUFNLDBCQUEwQixHQUFHLFFBQVEsQ0FBQztBQVVuRCxNQUFNLE9BQU8sV0FBWSxTQUFRLEtBQW1CO0lBRWhELFlBQVksSUFBcUI7UUFDN0IsS0FBSyxDQUFDLGFBQWEsRUFBRTtZQUNqQixNQUFNLEVBQUUsQ0FBQyxRQUFRLENBQUM7U0FDckIsQ0FBQyxDQUFDO1FBRUgsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQWlCLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuRCxDQUFDO0lBRU0sU0FBUztRQUNaLE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM5QixDQUFDO0lBRU0sU0FBUyxDQUFDLE1BQXFCO1FBQ2xDLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQy9CLENBQUM7SUFFTSxVQUFVO1FBQ2IsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFLEtB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QUFFLENBQUMsQ0FBQztBQUNqRywwQkFBYyxHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDO0FBQ3JHLDRDQUFnQyxHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3BILDBDQUE4QixHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ2xILGlEQUFxQyxHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzFILCtDQUFtQyxHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3hILG9DQUF3QixHQUF3QixNQUFNLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDIn0=