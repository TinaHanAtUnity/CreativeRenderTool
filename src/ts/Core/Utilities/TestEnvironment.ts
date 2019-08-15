import { MetaData } from 'Core/Utilities/MetaData';

export class TestEnvironment {
    public static setup(metaData: MetaData): Promise<void[]> {
        const clearMetaDataPromise = metaData.get('test.clearTestMetaData', false);
        const getKeysPromise = metaData.getKeys('test');
        return Promise.all([clearMetaDataPromise, getKeysPromise]).then(([[clearKeyFound, clearKeyValue], keys]) => {
            let deleteValue = false;
            if (clearKeyFound && typeof clearKeyValue === 'boolean') {
                deleteValue = clearKeyValue;
            }

            const promises: Promise<void>[] = [];
            keys.forEach((key) => {
                promises.push(metaData.get('test.' + key, deleteValue).then(([found, value]) => {
                    if (found) {
                        this._testEnvironment[key] = value;
                    }
                }));
            });
            return Promise.all(promises);
        });
    }

    public static get<T>(key: string): T {
        return <T>TestEnvironment._testEnvironment[key];
    }

    private static _testEnvironment: { [key: string]: unknown } = {};
}
