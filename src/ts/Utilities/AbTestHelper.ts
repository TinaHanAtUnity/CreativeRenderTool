import { ClientInfo } from 'Models/ClientInfo';

export class AbTestHelper {
    public static isYodo1CachingAbTestActive(abGroup: number | undefined, clientInfo: ClientInfo): boolean {
        return (abGroup === 6 || abGroup === 7) && AbTestHelper.yodo1GameIds.indexOf(clientInfo.getGameId()) !== -1;
    }

    private static yodo1GameIds: string[] = ['106137', '104949', '131624390', '77228', '83664', '82333', '81905', '119419', '74312', '84712', '77006', '83856', '1354255', '55783', '115176', '1354192', '83240', '21845', '1320785', '1320776', '94918', '109654', '81909', '117557', '100669', '114302', '1354485', '100670', '108111', '88280', '116117', '129536', '1368377', '20753', '22525', '37420', '82325', '109653'];
}
