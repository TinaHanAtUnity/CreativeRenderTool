import { MetaData } from 'Utilities/MetaData';

export class TestEnvironment {
    public static setup(metaData: MetaData): Promise<string[]> {
        return metaData.get("test.clearTestMetaData", false).then(([found, value]) => {
            let deleteValue = false;
            if(found && typeof value === 'boolean') {
                deleteValue = value;
            }
            return deleteValue;
        }).then(deleteValue => {
            return metaData.getKeys('test').then(keys => {
                const promises: any[] = [];
                keys.forEach((key) => {
                    promises.push(metaData.get('test.' + key, deleteValue).then(([found, value]) => {
                        if(found) {
                            this._testEnvironment[key] = value;
                        }
                    }));
                });
                return Promise.all(promises);
            });
        });
    }

    public static get(key: string): any {
        return TestEnvironment._testEnvironment[key];
    }

    private static _testEnvironment: { [key: string]: any } = {};
}
