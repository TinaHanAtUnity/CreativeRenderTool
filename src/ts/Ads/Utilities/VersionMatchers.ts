export class VersionMatchers {
    public static matchesMajorOSVersion(majorVersion: number, osVersion: string): boolean {
        const regex = new RegExp(`^${majorVersion}\\.|^${majorVersion}$`);
        return regex.test(osVersion);
    }
}
