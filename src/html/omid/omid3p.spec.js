const OmidVerification = require('html/omid/omid3p.html');

describe('omid3p', () => {
    let omid3p;
    let postMessageSpy;

    beforeAll(() => {
        omid3p = OmidVerification.substring(34, OmidVerification.length - 30);
        eval(omid3p);
    });

    beforeEach(() => {
        postMessageSpy = jest.fn();
        window.postMessage = postMessageSpy;
    });

    it('isSupported should return true', () => {
        expect(window.omid3p.isSupported()).toEqual(true);
    });
});