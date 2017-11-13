import 'mocha';
import { assert } from 'chai';

import { AdMobSignalFactory } from 'AdMob/AdMobSignalFactory';

describe('AdMobSignalFactoryTest', () => {
    it('should work', () => {
        assert(AdMobSignalFactory.createSomething());
    });
});
