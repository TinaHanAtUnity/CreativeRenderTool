import 'mocha';
import { assert } from 'chai';
import { ISchema, Model } from 'Models/Model';

describe('Value type checks', () => {
    let testModelData: any;

    beforeEach(() => {
        testModelData = {
            testString: 'testStringValue',
            testStringArray: ['testStringArrayValue1', 'testStringArrayValue2']
        };
    });

    it('Allows string value', () => {
        const testModel: TestModel = new TestModel(testModelData);

        assert.equal(testModel.get('testString'), testModelData.testString);
        testModel.set('testString', 'newTestStringValue');
        assert.equal(testModel.get('testString'), 'newTestStringValue');
    });

    it('Allows undefined string value', () => {
        const testModel: TestModel = new TestModel(testModelData);

        assert.equal(testModel.get('testStringOrUndefined'), undefined);
        testModel.set('testStringOrUndefined', 'newTestStringValue');
        assert.equal(testModel.get('testString'), 'newTestStringValue');
        testModel.set('testStringOrUndefined', undefined);
        assert.equal(testModel.get('testStringOrUndefined'), undefined);
    });

    it ('Allows string[] value', () => {
        const testModel: TestModel = new TestModel(testModelData);
        const newTestStringArray = ['newTestStringArrayValue1', 'newTestStringArrayValue2'];

        assert.equal(testModel.get('testStringArray'), testModelData.testStringArray);
        testModel.set('testStringArray', newTestStringArray);
        assert.equal(testModel.get('testStringArray'), 'newTestStringValue');
    });
});

interface ITestModel extends ISchema {
    testString: [string , string[]];
    testStringOrUndefined: [string | undefined, string[]];
    testStringArray: [string[], string[]];
}

export class TestModel extends Model<ITestModel> {
    constructor (data: any) {
        super ({
            testString: ['', ['string']],
            testStringOrUndefined: [undefined, ['string', 'undefined']],
            testStringArray: [[''], ['array']]
        });

        this.set('testString', data.testString);
        this.set('testStringArray', data.testStringArray);
        this.set('testStringArray', data.testStringOrUndefined);
    }

    public getDTO(): { [key: string]: any } {
        return {
            'testString': this.get('testString'),
            'testStringArray': this.get('testStringArray')
        };
    }
}
