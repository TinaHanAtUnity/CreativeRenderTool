import { Diagnostics } from 'Utilities/Diagnostics';

export class RNGTest {
    public static testId(id: string) {
        if(RNGTest._previousIds.indexOf(id) !== -1) {
            Diagnostics.trigger('duplicate_id', {
                duplicateId: id
            });
        } else {
            RNGTest._previousIds.push(id);
        }
    }

    private static _previousIds: string[] = [];
}
