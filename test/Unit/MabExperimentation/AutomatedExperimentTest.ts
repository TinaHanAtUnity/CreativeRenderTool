import { assert } from 'chai';
import 'mocha';
import { IExperimentDeclaration, IExperimentActionChoice, AutomatedExperiment } from 'MabExperimentation/Models/AutomatedExperiment';

describe('AutomatedExperimentTest', () => {
    const FooExperimentDeclaration: IExperimentDeclaration = {
        bar: {
            ACTION1: 'bar1',
            ACTION2: 'bar2'
        },
        baz: {
            ACTION1: 'baz1',
            ACTION2: 'baz2'
        },
        optional: {
            ACTION1: undefined,
            ACTION2: 'defined'
        }
    };

    const FooExperimentDefaultActions: IExperimentActionChoice = {
        bar: FooExperimentDeclaration.bar.ACTION2,
        baz: FooExperimentDeclaration.baz.ACTION1
    };

    const EndScreenExperiment = new AutomatedExperiment({
        actions: FooExperimentDeclaration,
        defaultActions: FooExperimentDefaultActions,
        cacheDisabled: true
    });

    it('should validate experiment action choices', () => {
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar1', baz: 'baz1' }));
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar1', baz: 'baz2' }));
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar2', baz: 'baz1' }));
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar2', baz: 'baz2' }));
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar2', baz: 'baz2', optional: 'defined' }));
    });

    it('should fail validation on invalid experiment action choices', () => {
        assert.isFalse(EndScreenExperiment.isValid({}));
        assert.isFalse(EndScreenExperiment.isValid({ bar: 'bar1' }));
        assert.isFalse(EndScreenExperiment.isValid({ baz: 'baz1' }));
        assert.isFalse(EndScreenExperiment.isValid({ baz: 'invalid' }));
        assert.isFalse(EndScreenExperiment.isValid({ someOtherField: 'sad' }));
        assert.isFalse(EndScreenExperiment.isValid({ bar: 'bar1', baz: 'invalid', someOtherField: 'baz1' }));
    });

    it('should validate experiment action choices with extra fields', () => {
        assert.isTrue(EndScreenExperiment.isValid({ bar: 'bar1', baz: 'baz1', extra: 'sad' }));
    });
});
