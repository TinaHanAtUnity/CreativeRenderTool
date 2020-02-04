/**
 * This file is called from the jest.config.js. It's currently called from the setupFiles
 * field and is run before every test file.
 */

require('../src/ts/Ads/Utilities/__mocks__/ProgrammaticTrackingService').MockPTS();
global.console = { log: jest.fn() };
