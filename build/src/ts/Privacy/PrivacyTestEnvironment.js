export class PrivacyTestEnvironment {
    static setup(metaData) {
        return metaData.getKeys('privacytest').then((keys) => {
            const promises = keys.map((key) => {
                return metaData.get('privacytest.' + key, false).then(([found, value]) => {
                    if (found) {
                        this._privacyEnvironment[key] = value;
                    }
                });
            });
            return Promise.all(promises).then(() => Promise.resolve());
        });
    }
    static get(key) {
        return PrivacyTestEnvironment._privacyEnvironment[key];
    }
    static isSet(key) {
        return PrivacyTestEnvironment._privacyEnvironment.hasOwnProperty(key);
    }
}
PrivacyTestEnvironment._privacyEnvironment = {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHJpdmFjeVRlc3RFbnZpcm9ubWVudC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90cy9Qcml2YWN5L1ByaXZhY3lUZXN0RW52aXJvbm1lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUEsTUFBTSxPQUFPLHNCQUFzQjtJQUd4QixNQUFNLENBQUMsS0FBSyxDQUFDLFFBQWtCO1FBQ2xDLE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtZQUNqRCxNQUFNLFFBQVEsR0FBb0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO2dCQUMvQyxPQUFPLFFBQVEsQ0FBQyxHQUFHLENBQUMsY0FBYyxHQUFHLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsRUFBRSxFQUFFO29CQUNyRSxJQUFJLEtBQUssRUFBRTt3QkFDUCxJQUFJLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO3FCQUN6QztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNQLENBQUMsQ0FBQyxDQUFDO1lBRUgsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTSxNQUFNLENBQUMsR0FBRyxDQUFJLEdBQVc7UUFDNUIsT0FBVSxzQkFBc0IsQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUM5RCxDQUFDO0lBRU0sTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFXO1FBQzNCLE9BQU8sc0JBQXNCLENBQUMsbUJBQW1CLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzFFLENBQUM7O0FBdEJjLDBDQUFtQixHQUErQixFQUFFLENBQUMifQ==