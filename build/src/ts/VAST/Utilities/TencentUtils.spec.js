import { Platform } from 'Core/Constants/Platform';
import { Tap } from 'Core/Utilities/__mocks__/Tap';
import { TencentUtils } from 'VAST/Utilities/TencentUtils';
[Platform.ANDROID, Platform.IOS].forEach(platform => {
    describe('TencentUtils', () => {
        let tap;
        let url;
        beforeEach(() => {
            url = 'https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"__REQ_WIDTH__","req_height":"__REQ_HEIGHT__","width":"__WIDTH__","height":"__HEIGHT__","down_x":"__DOWN_X__","down_y":"__DOWN_Y__","up_x":"__UP_X__","up_y":"__UP_Y__"}';
            tap = new Tap();
        });
        describe('when a url with corresponding macros', () => {
            it('the macros should be replaced', () => {
                expect(TencentUtils.replaceClickThroughMacro(url, tap)).toEqual('https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"10","down_y":"20","up_x":"10","up_y":"20"}');
            });
        });
        describe('when a tap object is undefined', () => {
            it('the macros should be replaced by -999', () => {
                expect(TencentUtils.replaceClickThroughMacro(url, undefined)).toEqual('https://c2.gdt.qq.com/gdt_click.fcg?viewid=mlsITUl9ffgwhhyanfhFC6PSKRWegO22lApBWRQXHAV39lzK_kqg8TYfD8aX53xMdP7MVrwCKH4Feu4!3oa_BBhWt4YBqeKe1CQG54t8WpQkNtl9VuTpec1s21Mb21TlcDl4w8Bslj9pyTeoEYdHJIhHkPDr0DGYUOOtUf1gtgaJ7oQKIOfEjVP8S8o9DdM7WTg450XRS0g72SnvSznljQsVbq9Q_TH!SjpIgcBMdqh0vD5u2_dh5VT5BuedXIn3Qkmk3PlWoRQ&jtype=0&i=1&os=1&lpp=click_ext=eyJnZHRfcHJvZHVjdF9pZCI6IjE0ODM4ODQ4NTgiLCJpc2Zyb213diI6MX0%3D&clklpp=__CLICK_LPP__&cdnxj=1&xp=3&acttype=35&s={"req_width":"0","req_height":"0","width":"0","height":"0","down_x":"-999","down_y":"-999","up_x":"-999","up_y":"-999"}');
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGVuY2VudFV0aWxzLnNwZWMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi9zcmMvdHMvVkFTVC9VdGlsaXRpZXMvVGVuY2VudFV0aWxzLnNwZWMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ25ELE9BQU8sRUFBRSxHQUFHLEVBQVcsTUFBTSw4QkFBOEIsQ0FBQztBQUM1RCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFM0QsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7SUFDaEQsUUFBUSxDQUFDLGNBQWMsRUFBRSxHQUFHLEVBQUU7UUFDMUIsSUFBSSxHQUFZLENBQUM7UUFDakIsSUFBSSxHQUFXLENBQUM7UUFDaEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLEdBQUcsR0FBRywybkJBQTJuQixDQUFDO1lBQ2xvQixHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDbEQsRUFBRSxDQUFDLCtCQUErQixFQUFFLEdBQUcsRUFBRTtnQkFDckMsTUFBTSxDQUFDLFlBQVksQ0FBQyx3QkFBd0IsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMscWpCQUFxakIsQ0FBQyxDQUFDO1lBQzNuQixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO1FBRUgsUUFBUSxDQUFDLGdDQUFnQyxFQUFFLEdBQUcsRUFBRTtZQUM1QyxFQUFFLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxFQUFFO2dCQUM3QyxNQUFNLENBQUMsWUFBWSxDQUFDLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyw2akJBQTZqQixDQUFDLENBQUM7WUFDem9CLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMsQ0FBQyxDQUFDIn0=