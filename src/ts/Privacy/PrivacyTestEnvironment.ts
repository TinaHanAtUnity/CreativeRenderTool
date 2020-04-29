import { MetaData } from 'Core/Utilities/MetaData';

export class PrivacyTestEnvironment {
    private static _privacyEnvironment: { [key: string]: unknown } = {};

    public static setup(metaData: MetaData): Promise<void> {
        return metaData.getKeys('privacytest').then((keys) => {
            const promises: Promise<void>[] = keys.map((key) => {
                return metaData.get('privacytest.' + key, false).then(([found, value]) => {
                    if (found) {
                        this._privacyEnvironment[key] = value;
                    }
                });
            });

            return Promise.all(promises).then(() => Promise.resolve());
        });
    }

    public static get<T>(key: string): T {
        return <T>PrivacyTestEnvironment._privacyEnvironment[key];
    }

    public static isSet(key: string): boolean {
        return PrivacyTestEnvironment._privacyEnvironment.hasOwnProperty(key);
    }
}
