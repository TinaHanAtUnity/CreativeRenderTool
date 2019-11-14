import { assert } from 'chai';
import 'mocha';
import { UserPrivacy } from 'Privacy/Privacy';

describe ('UserPrivacy', () => {
    context ('permissionsEql', () => {
        it ('return true when permissions are equal', () => {
            assert.isTrue(UserPrivacy.permissionsEql(UserPrivacy.PERM_ALL_FALSE, UserPrivacy.PERM_ALL_FALSE));
            assert.isTrue(UserPrivacy.permissionsEql(UserPrivacy.PERM_ALL_TRUE, UserPrivacy.PERM_ALL_TRUE));
            assert.isTrue(UserPrivacy.permissionsEql(UserPrivacy.PERM_DEVELOPER_CONSENTED, UserPrivacy.PERM_DEVELOPER_CONSENTED));
        });

        it ('returns false when permissions are NOT equal', () => {
            assert.isFalse(UserPrivacy.permissionsEql(UserPrivacy.PERM_ALL_FALSE, UserPrivacy.PERM_ALL_TRUE));
            assert.isFalse(UserPrivacy.permissionsEql(UserPrivacy.PERM_ALL_TRUE, UserPrivacy.PERM_ALL_FALSE));
            assert.isFalse(UserPrivacy.permissionsEql(UserPrivacy.PERM_ALL_FALSE, UserPrivacy.PERM_DEVELOPER_CONSENTED));
        });
    });
});
