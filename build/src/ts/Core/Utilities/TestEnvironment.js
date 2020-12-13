export class TestEnvironment {
    static setup(metaData) {
        const clearMetaDataPromise = metaData.get('test.clearTestMetaData', false);
        const getKeysPromise = metaData.getKeys('test');
        return Promise.all([clearMetaDataPromise, getKeysPromise]).then(([[clearKeyFound, clearKeyValue], keys]) => {
            let deleteValue = false;
            if (clearKeyFound && typeof clearKeyValue === 'boolean') {
                deleteValue = clearKeyValue;
            }
            const promises = [];
            keys.forEach((key) => {
                promises.push(metaData.get('test.' + key, deleteValue).then(([found, value]) => {
                    if (found) {
                        this._testEnvironment[key] = value;
                    }
                }));
            });
            return Promise.all(promises);
        });
    }
    static get(key) {
        return TestEnvironment._testEnvironment[key];
    }
}
TestEnvironment._testEnvironment = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVzdEVudmlyb25tZW50LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0NvcmUvVXRpbGl0aWVzL1Rlc3RFbnZpcm9ubWVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFFQSxNQUFNLE9BQU8sZUFBZTtJQUNqQixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQWtCO1FBQ2xDLE1BQU0sb0JBQW9CLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUMzRSxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2hELE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLG9CQUFvQixFQUFFLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxhQUFhLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFFO1lBQ3ZHLElBQUksV0FBVyxHQUFHLEtBQUssQ0FBQztZQUN4QixJQUFJLGFBQWEsSUFBSSxPQUFPLGFBQWEsS0FBSyxTQUFTLEVBQUU7Z0JBQ3JELFdBQVcsR0FBRyxhQUFhLENBQUM7YUFDL0I7WUFFRCxNQUFNLFFBQVEsR0FBb0IsRUFBRSxDQUFDO1lBQ3JDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDakIsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBRyxHQUFHLEVBQUUsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxDQUFDLEVBQUUsRUFBRTtvQkFDM0UsSUFBSSxLQUFLLEVBQUU7d0JBQ1AsSUFBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztxQkFDdEM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNSLENBQUMsQ0FBQyxDQUFDO1lBQ0gsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2pDLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLE1BQU0sQ0FBQyxHQUFHLENBQUksR0FBVztRQUM1QixPQUFVLGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwRCxDQUFDOztBQUVjLGdDQUFnQixHQUErQixFQUFFLENBQUMifQ==