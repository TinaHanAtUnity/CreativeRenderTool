import { Diagnostics } from 'Utilities/Diagnostics';

export class RNGTest {
    public static testId(id: string) {
        if(RNGTest._previousIds[id]) {
            Diagnostics.trigger('duplicate_id', {
                duplicateId: id
            });
        } else {
            RNGTest._previousIds[id] = true;
        }
    }

    private static _previousIds: { [id: string]: boolean } = {};
}
