import { Core } from 'Core/__mocks__/Core';
import { Ads } from 'Ads/__mocks__/Ads';
import { VastAdUnitParametersFactory } from 'VAST/AdUnits/VastAdUnitParametersFactory';

describe('VastAdUnitParametersFactory', () => {
    const ads = new Ads();
    const core = new Core();
    const paramsFactory = new VastAdUnitParametersFactory(core, ads);

    it('should dedupe values greater than 1', ()  => {
        const arr = ['IAS', 'IAS', 'Booyah'];

        const dedupedArr = paramsFactory.dedupe(arr);

        expect(dedupedArr).toEqual(['IAS', 'Booyah']);
    });

    it('should dedupe values greater than 3', ()  => {
        const arr = ['IAS', 'IAS', 'IAS', 'IAS', 'Booyah', 'Booyah'];

        const dedupedArr = paramsFactory.dedupe(arr);

        expect(dedupedArr).toEqual(['IAS', 'Booyah']);
    });

    it('should not dedupe non-dedupable doops', ()  => {
        const arr = ['IAS'];

        const dedupedArr = paramsFactory.dedupe(arr);

        expect(dedupedArr).toEqual(['IAS']);
    });
});
