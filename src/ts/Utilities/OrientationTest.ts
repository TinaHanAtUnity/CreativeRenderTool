import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { Orientation, DeviceOrientation } from 'Utilities/Orientation';

describe('Orientation Utilities', () => {

    let sandbox: sinon.SinonSandbox;

    beforeEach(() => {
        sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('Portrait oriented device', () => {
        const width = 320;
        const height = 640;

        it('should return portrait orientation', () => {
            sandbox.stub(window, 'innerWidth', width);
            sandbox.stub(window, 'innerHeight', height);

            const orientation = DeviceOrientation.getDeviceOrientation();
            assert.equal(Orientation.PORTRAIT, orientation, 'Orientation was not portrait.');
        });
    });

    describe('Landscape oriented device', () => {
        const width = 640;
        const height = 320;

        it('should return landscape orientation', () => {
            sandbox.stub(window, 'innerWidth', width);
            sandbox.stub(window, 'innerHeight', height);

            const orientation = DeviceOrientation.getDeviceOrientation();
            assert.equal(Orientation.LANDSCAPE, orientation, 'Orientation was not landscape.');
        });
    });
});

