const releases = require('./releases');

describe('releases', () => {
    describe('getReleaseVersion', () => {
        describe('calling with webview branch: master', () => {
            let element;

            beforeEach(() => {
                element = releases.getReleaseVersion('master');
            });

            it('should return an element', () => {
                expect(element).toBeDefined();
            });

            it('should return correct native branches', () => {
                expect(element.native).toEqual(['master']);
            });

            it('should return correct webview branch', () => {
                expect(element.webview).toEqual('development');
            });
        });

        describe('calling with webview branch: 3.0.1', () => {
            let element;

            beforeEach(() => {
                element = releases.getReleaseVersion('3.0.1');
            });

            it('should return an element', () => {
                expect(element).toBeDefined();
            });

            it('should return correct native branches', () => {
                expect(element.native).toEqual(["3.0.1", "3.0.1-rc2"]);
            });

            it('should return correct webview branch', () => {
                expect(element.webview).toEqual('3.0.1');
            });
        });

        describe('calling with a non-release branch', () => {
            let element;

            beforeEach(() => {
                element = releases.getReleaseVersion('feature/scott');
            });

            it('should not return an element', () => {
                expect(element).toBeUndefined();
            });
        });

    });
});
