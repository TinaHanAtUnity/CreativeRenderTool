import { ABGroup, AllowRewardedSkipTest } from 'Core/Models/ABGroup';
import { Campaign } from 'Ads/Models/Campaign';
import { PerformanceCampaign } from 'Performance/Models/PerformanceCampaign';
import { IAdUnitParameters } from 'Ads/AdUnits/AbstractAdUnit';

let cachedGameAllowsEarlySkip: boolean;
const gameIdsAllowingEarlySkip = ['133420', '500000868', '136461', '140632', '500005487', '500009516', '500005062', '132754', '142369', '500010937', '500000030', '84940', '500009980', '119612', '132744', '1434564', '1643255', '18940', '500001493', '500005488', '137253', '138311', '500012194', '142489', '131577', '113112', '500011507', '1566453', '139588', '127540', '133697', '140013', '71929', '500009788', '140091', '135827', '500008145', '141420', '500010257', '500006046', '12613', '500008085', '133421', '500003015', '15665', '28227', '500004429', '500000261', '55668', '48114', '113199', '500007261', '500000142', '500008144', '140980', '500005222', '500009727', '500009127', '140628', '500005530', '91664', '132743', '41565', '500012050', '500000218', '141420', '140102', '500004442', '500005734', '11202', '55667', '500001509', '145554', '128473', '500001500', '142723', '20955', '500011319', '500005027', '500005024', '40546', '500000492', '500009044', '500006206', '144288', '500002277', '115378', '87101', '143375', '61445', '138526', '500001453', '500002008', '500010625', '500001359', '500004712', '500000219', '139695', '138311', '500006375', '500010308', '121853', '500009979', '140314', '103308', '133405', '500002956', '500008003', '500010453', '500000314', '127757', '500010778', '500010494', '144218', '500003676', '142573', '500000438', '134858', '500009957', '500000783', '500011579', '139771', '87101', '500009006', '500007005', '500009391', '500008570', '136577', '141362', '500009290', '500003259', '500008868', '500002006', '141069', '92220', '500006569', '137962', '500011010', '500000282', '500004567', '500005887', '84959', '114755', '55790', '500011569', '140428', '1581129', '139565', '1562155', '500009599', '500000321', '500008877', '500010394', '111181', '500005447', '14587', '14682', '86061', '139434', '500011570', '500006791', '500008272', '143074', '500000305', '114448', '145376', '500008688', '500001658', '139953', '500010308', '500010780', '500001357', '132755', '142521', '500005287', '135353', '1717876', '500006485', '500000071', '144857', '1069514', '500009117', '129893', '500005114', '500010298', '500011035', '500003175', '500008893', '91663', '142520', '500009957', '92272', '144178', '500010820', '144292', '139139', '500006148', '500000868', '500000154', '129156', '500000283', '500009945', '125424', '138793', '500010203', '500002152', '500008086', '132652', '500005097', '500010625', '1122415', '137252', '500000879', '500000207', '138787', '135398', '1434564', '500010794', '71912', '132366', '1373093', '139008', '137604', '128334', '1649769', '137112', '500000291', '500008484', '500007983', '500004192', '500009563', '1420090', '119700', '500008298', '500000299', '12342', '145051', '115377', '500011639', '143695', '140838', '130493', '500006144', '500010851', '500000728', '12723', '500000298', '500009276', '138504', '500000094', '500002945', '144266', '139431', '500001357', '12723', '11076', '500000266', '500011185', '500010264', '139694', '500005028', '500008086', '500009946', '500000578', '500010980', '500010269', '13327', '500002742', '140631', '1695309', '500005799', '500010553', '500009675', '83416', '500002277', '500002649', '114179', '500004738', '141660', '500000592', '500010501', '500010380', '143352', '500011918', '28269', '41566', '500008870', '139344', '500000239', '500004030', '500003139', '500010207', '137604', '500007716', '60163', '500000493', '139953', '500002741', '138785', '83262', '20321', '500000310', '137924', '500001452', '500009793', '135179', '127907', '500001212', '500002599', '500006579', '500005532', '135828', '145056', '500002741', '22600', '138792', '500010710', '141337', '500010936', '1192160', '500004438', '500010218', '500011555', '89244', '1458550', '1326582', '144570', '127756', '500008738', '500010504', '500010340', '500008063', '500011537', '142640', '144380', '1683511', '140904', '86062', '500011657', '55788', '500011891', '500011701', '500001838', '500004639', '500005461', '138255', '130691', '141640', '500005460', '500007368', '500000265', '500011697', '140204', '127391', '500004118', '86061', '500000242', '500010075', '1374413', '500005063', '500011917', '500009477', '500006064', '500004086', '500012094', '127417', '500000324', '500007895', '500006951', '130493', '500008780', '125423', '500009662', '500001698', '48116', '137715', '500000313', '139735', '144730', '138788', '142533', '500006095', '134194', '130444', '500003797', '140101', '500006296', '138256', '500011905', '500011034', '500006897', '500003729', '500006380', '500009138', '145518', '500010261', '138527', '500000618', '500007075', '500006568', '84958', '84958', '500008445', '105179', '500006951', '500000982', '144883', '500000113', '500010537', '500007342', '500003825', '137044', '500003252', '500000528', '500010492', '122309', '500006090', '1420089', '500000297', '500006284', '500001881', '500007618', '500005948', '1647184', '500002538', '111714', '500008273', '57873', '1440773', '141818', '144289', '500001024', '141279', '139080', '143353', '145300', '83261', '500008992', '500002278', '144435', '117070', '105577', '11075', '500007256', '500010700', '500010554', '500008737', '122939', '131965', '500000031', '132230', '140838', '1326583', '1373094', '60245', '500000072', '500007894', '29651', '500010623', '500012094', '500011351', '500006286', '500007851', '1082906', '500009674', '500009613', '144858', '136085', '84958', '92941', '500000274', '21219', '140013', '103309', '500000104', '500006301', '500011634', '76738', '143196', '133403', '11201', '500010986', '500010046', '140859', '146161', '137858', '500000296', '500007671', '145567', '500001492', '24152', '500010291', '133921', '141561', '500000095', '500007144', '500010478', '144761', '140563', '500001657'];

export class CustomFeatures {
    public static isExampleGameId(gameId: string): boolean {
        return gameId === '14850' || gameId === '14851';
    }

    public static isTimehopApp(gameId: string): boolean {
        return gameId === '1300023' || gameId === '1300024';
    }

    public static isSonicPlayable(creativeId: string | undefined) {
        return creativeId === '109455881' ||
            creativeId === '109455877' ||
            creativeId === '109091853' ||
            creativeId === '109091754' ||
            creativeId === '114617576' || // Hellfest
            creativeId === '114617336';   // Hellfest
    }

    public static isTencentAdvertisement(seatId: number | undefined) {
        return seatId === 9107;
    }

    public static isPlayableConfigurationEnabled(originalResourceUrl: string) {
        return originalResourceUrl.match(/playables\/production\/unity/);
    }

    public static isSimejiJapaneseKeyboardApp(gameId: string): boolean {
        // Baidu's Simeji Japanese Keyboard extension app
        // Ad unit should be closed when going background on iOS
        return gameId === '1795561';
    }

    public static isCheetahGame(gameId: string) {
        // skip icon is replaced with the close icon
        // Android back button enabled on video overlays for skipping the video ads
        return gameId === '1196341'
            || gameId === '1594775'
            || gameId === '2755671'
            || gameId === '1451510'
            || gameId === '1585102'
            || gameId === '2808037'
            || gameId === '2755670'
            || gameId === '2625701'
            || gameId === '2625703'
            || gameId === '2845426';
    }

    public static allowSkipInRewardedVideos<T extends Campaign = Campaign>(parameters: IAdUnitParameters<T>): boolean {
        if (!(parameters.campaign instanceof PerformanceCampaign)) {
            return false;
        }

        if (!AllowRewardedSkipTest.isValid(parameters.coreConfig.getAbGroup())) {
            return false;
        }

        if (parameters.placement.allowSkip()) {
            return false;
        }

        return CustomFeatures.gameAllowsEarlySkip(parameters.clientInfo.getGameId());
    }

    public static gameAllowsEarlySkip(gameId: string): boolean {
        if (cachedGameAllowsEarlySkip !== undefined) {
            return cachedGameAllowsEarlySkip;
        }

        cachedGameAllowsEarlySkip = gameIdsAllowingEarlySkip.indexOf(gameId) !== -1;
        return cachedGameAllowsEarlySkip;
    }

    // Following 2 functions could be merged at some point later
    public static isSliderEndScreenEnabled(campaignId: string): boolean {
        const targetCampaignIds = [
            'TBD',
            'TBD'
        ];

        return true;
    }

    private static getSlideshowCampaignIDs(): string {
        const targetGameIds = [
            '343200656',
            'com.supercell.brawlstars',
            'com.hcg.cok.gp'
        ];
        const randomGame = Math.floor(Math.random() * 3);
        return targetGameIds[randomGame];
        }

    public static getScreenshotsUrls(campaignId: string): string[] {
        const campaignId_rnd = CustomFeatures.getSlideshowCampaignIDs();
        const screenshots: { [key: string]: string[] } = {
            '343200656':[
                'https://unity-ads-test.s3.amazonaws.com/343200656/0.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/4.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/1.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/2.png',
                'https://unity-ads-test.s3.amazonaws.com/343200656/3.png'
            ],
            'com.supercell.brawlstars':[
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/2.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/7.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/1.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/0.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/4.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/3.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/12.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/5.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/10.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/9.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/14.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/11.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/6.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/8.png',
                'https://unity-ads-test.s3.amazonaws.com/com.supercell.brawlstars/13.png'
            ],
            'com.hcg.cok.gp':[
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/5.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/0.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/4.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/2.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/3.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/6.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/1.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/18.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/16.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/15.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/19.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/14.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/17.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/7.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/8.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/11.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/20.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/9.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/13.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/12.png',
                'https://unity-ads-test.s3.amazonaws.com/com.hcg.cok.gp/10.png'
            ]
        };
        return screenshots[campaignId_rnd];
    }
}
