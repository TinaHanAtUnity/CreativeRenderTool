import { NativeBridge } from 'Native/NativeBridge';
import { MetaData } from 'Utilities/MetaData';

export class TestEnvironment {
    public static setup(nativeBridge: NativeBridge): Promise<void[]> {
        const metaData: MetaData = new MetaData(nativeBridge);

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
            return promises;
        });
    }

    public static get(key: string): any {
        return this._testEnvironment[key];
    }

    private static _testEnvironment: { [key: string]: any } = {};
}
