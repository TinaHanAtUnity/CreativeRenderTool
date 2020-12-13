export class SessionUtils {
    static getSessionStorageKey(sessionId) {
        return 'session.' + sessionId;
    }
    static getSessionStorageTimestampKey(sessionId) {
        return SessionUtils.getSessionStorageKey(sessionId) + '.ts';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2Vzc2lvblV0aWxzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3RzL0Fkcy9VdGlsaXRpZXMvU2Vzc2lvblV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE1BQU0sT0FBTyxZQUFZO0lBQ2QsTUFBTSxDQUFDLG9CQUFvQixDQUFDLFNBQWlCO1FBQ2hELE9BQU8sVUFBVSxHQUFHLFNBQVMsQ0FBQztJQUNsQyxDQUFDO0lBRU0sTUFBTSxDQUFDLDZCQUE2QixDQUFDLFNBQWlCO1FBQ3pELE9BQU8sWUFBWSxDQUFDLG9CQUFvQixDQUFDLFNBQVMsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUNoRSxDQUFDO0NBQ0oifQ==