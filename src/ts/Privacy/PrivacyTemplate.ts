abstract class PrivacyTemplate {
    public getValueFor(type: unknown): unknown {
        if (typeof type !== 'string') {
            return type;
        }

        const typeSplit = type.split('.');
        switch (typeSplit[0]) {
            case 'device':
                switch (typeSplit[1]) {
                    case 'platform':
                        return 'android';
                    case 'androidId':
                        return 'fakeAndroidId';
                    default:
                        return type;
                }
            case 'user':
                switch  (typeSplit[1]) {
                    case 'advertisingId':
                        return 'fakeAdvertisingId';
                    case 'UUID':
                        return 'fakeUUID';
                    case 'locales':
                        return ['en_FI', 'fi_EN'];
                    case 'defaultLocale':
                        return 'en_FI';
                    default:
                        return type;
                }
            case 'build':
                switch (typeSplit[1]) {
                    case 'apiLevel':
                        return 12;
                    case 'osVersion':
                        return '8.0.1';
                    default:
                        return type;
                }
            case 'privacy':
                switch (typeSplit[1]) {
                    case 'settings':
                        return {};
                    case 'id':
                        return '75349hfsksfh';
                    case 'env':
                        return {};
                    case 'developerConsent':
                        return {};
                    default:
                        return type;
                }
            default:
                return type;
        }
    }
}
