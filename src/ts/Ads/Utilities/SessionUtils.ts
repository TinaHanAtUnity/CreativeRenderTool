export class SessionUtils {
    public static getSessionStorageKey(sessionId: string): string {
        return 'session.' + sessionId;
    }

    public static getSessionStorageTimestampKey(sessionId: string): string {
        return SessionUtils.getSessionStorageKey(sessionId) + '.ts';
    }
}
