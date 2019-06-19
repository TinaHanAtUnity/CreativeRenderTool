import 'mocha';

class IntegrationTestsFrameworkError extends Error {
}

export class Assertions {
    private _done: Mocha.Done;

    constructor(done: Mocha.Done) {
        this._done = done;
    }

    public fail(message: string) {
        this._done(new Error(message));
        throw new IntegrationTestsFrameworkError();
    }

    public equal(actual: unknown, expected: unknown, message: string) {
        try {
            chai.expect(actual, message).to.be.equal(expected);
        } catch(err) {
            this._done(err);
            throw new IntegrationTestsFrameworkError();
        }
    }
}

export function test(name: string, func: (t: Assertions) => Promise<void>, params: {timeout: number}) {
    describe(name, () => {
        it(name, (done) => {
            const promise = func(new Assertions(done));
            promise.then(done).catch((err) => {
                if (!(err instanceof IntegrationTestsFrameworkError)) {
                    done(err);
                }
            });
        }).timeout(params.timeout);
    });
}
