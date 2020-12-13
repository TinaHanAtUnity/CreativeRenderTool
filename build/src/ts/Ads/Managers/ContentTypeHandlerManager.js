export class ContentTypeHandlerManager {
    constructor() {
        this._parsers = {};
        this._factories = {};
    }
    addHandler(contentType, handler) {
        if (!(contentType in this._parsers) && !(contentType in this._factories)) {
            this._parsers[contentType] = handler.parser;
            this._factories[contentType] = handler.factory;
        }
        else {
            throw new Error('Handler already defined for content-type: ' + contentType);
        }
    }
    getParser(contentType) {
        if (contentType in this._parsers) {
            return this._parsers[contentType];
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
    getFactory(contentType) {
        if (contentType in this._factories) {
            return this._factories[contentType];
        }
        throw new Error(`Unsupported content-type: ${contentType}`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udGVudFR5cGVIYW5kbGVyTWFuYWdlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3NyYy90cy9BZHMvTWFuYWdlcnMvQ29udGVudFR5cGVIYW5kbGVyTWFuYWdlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFNQSxNQUFNLE9BQU8seUJBQXlCO0lBQXRDO1FBRVksYUFBUSxHQUFzQyxFQUFFLENBQUM7UUFDakQsZUFBVSxHQUFvRixFQUFFLENBQUM7SUF5QjdHLENBQUM7SUF2QlUsVUFBVSxDQUFDLFdBQW1CLEVBQUUsT0FBNEI7UUFDL0QsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRTtZQUN0RSxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7WUFDNUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1NBQ2xEO2FBQU07WUFDSCxNQUFNLElBQUksS0FBSyxDQUFDLDRDQUE0QyxHQUFHLFdBQVcsQ0FBQyxDQUFDO1NBQy9FO0lBQ0wsQ0FBQztJQUVNLFNBQVMsQ0FBQyxXQUFtQjtRQUNoQyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzlCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUNyQztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVNLFVBQVUsQ0FBQyxXQUFtQjtRQUNqQyxJQUFJLFdBQVcsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2hDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUN2QztRQUNELE1BQU0sSUFBSSxLQUFLLENBQUMsNkJBQTZCLFdBQVcsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztDQUVKIn0=