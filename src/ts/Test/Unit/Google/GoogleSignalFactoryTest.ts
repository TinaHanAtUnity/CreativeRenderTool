import 'mocha';
import { assert } from 'chai';

import { GoogleSignalFactory } from 'Google/GoogleSignalFactory';

describe('GoogleSignalFactoryTest', () => {
    it('should work', () => {
        assert(GoogleSignalFactory.createSomething());
    });
});
