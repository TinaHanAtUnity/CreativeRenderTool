import { MetaData } from 'Core/Utilities/MetaData';

export class PrivacyEnvironment {
    private static _privacyEnvironment: { [key: string]: unknown } = {};

    public static setup(metaData: MetaData): Promise<void[]> {
        return metaData.getKeys('privacyenv').then((keys) => {
            const promises: Promise<void>[] = [];
            keys.forEach((key) => {
                promises.push(metaData.get('privacyenv.' + key, false).then(([found, value]) => {
                    if (found) {
                        this._privacyEnvironment[key] = value;
                    }
                }));
            });

            return Promise.all(promises);
        });
    }

    public static get<T>(key: string): T {
        return <T>PrivacyEnvironment._privacyEnvironment[key];
    }

    public static isSet(key: string): boolean {
        return PrivacyEnvironment._privacyEnvironment.hasOwnProperty(key);
    }
}
