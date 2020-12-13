import 'mocha';
class IntegrationTestsFrameworkError extends Error {
}
export class Assertions {
    constructor(done) {
        this._done = done;
    }
    fail(message) {
        this._done(new Error(message));
        throw new IntegrationTestsFrameworkError();
    }
    equal(actual, expected, message) {
        try {
            chai.expect(actual, message).to.be.equal(expected);
        }
        catch (err) {
            this._done(err);
            throw new IntegrationTestsFrameworkError();
        }
    }
}
export function test(name, func, params) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSW50ZWdyYXRpb25UZXN0c0ZyYW1ld29yay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3QvVGVzdEhlbHBlcnMvSW50ZWdyYXRpb25UZXN0c0ZyYW1ld29yay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE9BQU8sQ0FBQztBQUVmLE1BQU0sOEJBQStCLFNBQVEsS0FBSztDQUNqRDtBQUVELE1BQU0sT0FBTyxVQUFVO0lBR25CLFlBQVksSUFBZ0I7UUFDeEIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7SUFDdEIsQ0FBQztJQUVNLElBQUksQ0FBQyxPQUFlO1FBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMvQixNQUFNLElBQUksOEJBQThCLEVBQUUsQ0FBQztJQUMvQyxDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQWUsRUFBRSxRQUFpQixFQUFFLE9BQWU7UUFDNUQsSUFBSTtZQUNBLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ3REO1FBQUMsT0FBTyxHQUFHLEVBQUU7WUFDVixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2hCLE1BQU0sSUFBSSw4QkFBOEIsRUFBRSxDQUFDO1NBQzlDO0lBQ0wsQ0FBQztDQUNKO0FBRUQsTUFBTSxVQUFVLElBQUksQ0FBQyxJQUFZLEVBQUUsSUFBc0MsRUFBRSxNQUF5QjtJQUNoRyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsRUFBRTtRQUNoQixFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxFQUFFLEVBQUU7WUFDZCxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUM3QixJQUFJLENBQUMsQ0FBQyxHQUFHLFlBQVksOEJBQThCLENBQUMsRUFBRTtvQkFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNiO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyJ9