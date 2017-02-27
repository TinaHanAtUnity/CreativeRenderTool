import { MetaData } from 'Utilities/MetaData';

export class TestEnvironment {
    public static setup(metaData: MetaData): Promise<string[]> {
        return metaData.getKeys('test').then(keys => {
            const promises: any[] = [];
            for(const key in keys) {
                if(keys.hasOwnProperty(key)) {
                    promises.push(metaData.get('test.' + keys[key], true).then(([found, value]) => {
                        if(found) {
                            this._testEnvironment[keys[key]] = value;
                        }
                    }));
                }
            }
            return Promise.all(promises);
        });
    }

    public static get(key: string): any {
        return TestEnvironment._testEnvironment[key];
    }

    private static _testEnvironment: { [key: string]: any } = {};
}
