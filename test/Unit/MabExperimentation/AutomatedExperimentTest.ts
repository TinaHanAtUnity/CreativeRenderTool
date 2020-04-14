import { assert } from 'chai';
import 'mocha';
import { IExperimentDeclaration, IExperimentActionChoice, AutomatedExperiment } from 'MABOptimization/Models/AutomatedExperiment';

describe('AutomatedExperimentTest', () => {
    const FooExperimentDeclaration: IExperimentDeclaration = {
        bar: {
            ACTION1: 'bar1',
            ACTION2: 'bar2'
        },
        baz: {
            ACTION1: 'baz1',
            ACTION2: 'baz2'
        }
    };

    const FooExperimentDefaultActions: IExperimentActionChoice = {
        bar: FooExperimentDeclaration.bar.ACTION2,
        baz: FooExperimentDeclaration.baz.ACTION1
    };

    const ButtonAnimationsExperiment = new AutomatedExperiment({
        name: 'foo-experiment',
        actions: FooExperimentDeclaration,
        defaultActions: FooExperimentDefaultActions,
        cacheDisabled: true
    });

    it('should validate experiment action choices', () => {
        assert.isTrue(ButtonAnimationsExperiment.isValid({bar: 'bar1', baz: 'baz1'}));
        assert.isTrue(ButtonAnimationsExperiment.isValid({bar: 'bar1', baz: 'baz2'}));
        assert.isTrue(ButtonAnimationsExperiment.isValid({bar: 'bar2', baz: 'baz1'}));
        assert.isTrue(ButtonAnimationsExperiment.isValid({bar: 'bar2', baz: 'baz2'}));
    });

    it('should fail validation on invalid experiment action choices', () => {
        assert.isFalse(ButtonAnimationsExperiment.isValid({}));
        assert.isFalse(ButtonAnimationsExperiment.isValid({bar: 'bar1'}));
        assert.isFalse(ButtonAnimationsExperiment.isValid({baz: 'baz1'}));
        assert.isFalse(ButtonAnimationsExperiment.isValid({baz: 'invalid'}));
        assert.isFalse(ButtonAnimationsExperiment.isValid({someOtherField: 'sad'}));
        assert.isFalse(ButtonAnimationsExperiment.isValid({bar: 'bar1', baz: 'invalid', someOtherField: 'baz1'}));
    });

    it('should validate experiment action choices with extra fields', () => {
        assert.isTrue(ButtonAnimationsExperiment.isValid({bar: 'bar1', baz: 'baz1', extra: 'sad'}));
    });
});
