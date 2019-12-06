import 'Workarounds.ts';

describe('Workarounds', () => {
    describe('Array prototype unique', () => {
        it('should dedupe values greater than 1', ()  => {
            const arr = ['IAS', 'IAS', 'Booyah'];

            const dedupedArr = arr.unique();

            expect(dedupedArr).toEqual(['IAS', 'Booyah']);
        });

        it('should dedupe values greater than 3', ()  => {
            const arr = ['IAS', 'IAS', 'IAS', 'IAS', 'Booyah', 'Booyah'];

            const dedupedArr = arr.unique();

            expect(dedupedArr).toEqual(['IAS', 'Booyah']);
        });
        it('should not dedupe non-dedupable doops', ()  => {
            const arr = ['IAS'];

            const dedupedArr = arr.unique();

            expect(dedupedArr).toEqual(['IAS']);
        });
    });
});