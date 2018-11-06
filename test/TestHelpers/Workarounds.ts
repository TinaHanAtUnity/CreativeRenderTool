import 'mocha';
import * as sinon from 'sinon';

afterEach(() => {
    (<any>sinon).restore();
});
