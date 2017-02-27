import { MetaData } from 'Utilities/MetaData';

export class TestEnvironment {
    public static setup(metaData: MetaData): Promise<string[]> {
        return metaData.getKeys('test').then(keys => {
            const promises: any[] = [];
            keys.forEach((key) => {
                promises.push(metaData.get('test.' + key, true).then(([found, value]) => {
                    if(found) {
                        this._testEnvironment[key] = value;
                    }
                }));
            });
            return Promise.all(promises);
        });
    }

    public static get(key: string): any {
        return TestEnvironment._testEnvironment[key];
    }

    private static _testEnvironment: { [key: string]: any } = {};
}
