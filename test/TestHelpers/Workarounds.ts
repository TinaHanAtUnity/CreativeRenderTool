import 'mocha';
import * as sinon from 'sinon';

afterEach(() => {
    (<unknown>sinon).restore();
});
