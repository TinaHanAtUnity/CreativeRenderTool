import { assert } from 'chai';
import 'mocha';
import { VastCompanionAdIframeResource } from 'VAST/Models/VastCompanionAdIframeResource';
import { VastCompanionAdType } from 'VAST/Models/IVastCreativeCompanionAd';

describe('VastCompanionAdIFrameResource', () => {
    it('should have the correct data', () => {
        const vastCreativeCompanionAd = new VastCompanionAdIframeResource('id', 700, 800);
        vastCreativeCompanionAd.setIframeResourceURL('https://search.spotxchange.com/banner?_a=235398&_p=spotx&_z=1&_m=eNp9Tk1rwzAM9f6Kz8WVbMexAztspIdCayhrGeRSnI9C0qQJSQqBrr998xoGO1VCgvckvSfJAAghGCjQ2ghUJA1TbULIDQeFWBiHOsMc4GRUCACCcBEIo8nhg2DIWaCYkIxLIOn1ktdFtFxmbcOa8lJmddmx1A3nYkxdXQ%2Bj6wdiD5uNl5CoBXmZ0aMh%2BfZBQg4Tcg0eP%2BgbPbVel0Zjfy0WNHejo9GNzl7H0g%2FoMzu6oK7rjsPY9vO2nIn%2F94iBESqQ9H7%2Fe%2BU34WtbvQnbrOW22k127%2BtzNdl4J5M4w2RfVzZeCxu%2Fn5Nm9foDZQZgPw%3D%3D&_l=eNp1kEtrAkEQhPu37NUgPY%2Beh5BLUCTBKAlq0IvMzsyqG3dXdAWD8b9nQA%2B5SEP3oaq%2BhmKGCU4CtFWIqIFAk5IgORkDwIBJNFJyhOO%2Bac%2FQ6QDnAuqmjoBwyUTWu2T5NmS9DLspL5mUWqEiTIDsKdu7n%2BbU3lWygpFBQxw5qqQe97F%2BHD3lu61fxbPfuHodV0WMdytikv3p4NoYVpU7fMd2v3M%2BPvBerzCejUa3Bdg18Dl9gaOrW1fEbnNYg3XWBKG0kDrkggdkxgZTSOdCbrXjt06U4oYzIE%2Fp%2BEIUushD8Ew5FaygG58LyYz49xDTJBwxmZLW6UDG%2BVSqEC6EoHLKA%2FxOhoPze%2FkhFl%2FzzZjPaFGGajycl5P%2BvFz213w5fauW01daVIPnPwJzcQg%3D&_t=eNpFkF1LwzAUhvtbci2apGnXRrxQ%2FMCLdSgDUYRympy2waYpbabTuf9uuinmJnme9xx4SQV9j2NULZALmoqc05QxzIFlimlK6zxdUErjSLVg%2BsiNDfRGRdVxa0csagOl0USSrK4zzBKsGQUdVzrXKuZCCMW4RqSCnJDajRZ8mL27vw1ojcXSfw4YjLHQ4OtZY%2BoQfBjt2yBjSgO1aJp23uLJAb3tSuXs0KHFfvZBGqhKYzcB5kYbW46oPPRNhyGcEEbVltOAisgdGWAEix7HaSaN70bh%2FMKtn69pcH5bHnUJw%2FDbkO9DYaexI1KcEBd2k304UcROKY1ApnI3SSGJMv6TnBtJzycZS6It%2FNEihG7T%2B%2FGQcx4Hl0rSdK6C7m8oiMFN%2Fl%2FEh7850j5iWZ4w8V1c3ySrp%2FuP5bp7W17fxMuvwrysH81qfZkUdw%2Fb4qt4W62vumf%2BcPEDqPqVsw%3D%3D&_b=eNozYLDQT9O3SEuzSLUwTU0zNEhMMU5KsUxJNjYyMTFJNjRKSU01MNHLKMnNYfAL9fFBEDW%2BIYEGvlmuhn4hgcZRLumVvu6hRlFZKdmRIemGkSFBmb5ZvgaRIU7ZflW%2BtgD3%2BB68&resource_type=iframe');

        assert.equal(vastCreativeCompanionAd.getId(), 'id');
        assert.equal(vastCreativeCompanionAd.getHeight(), 700);
        assert.equal(vastCreativeCompanionAd.getWidth(), 800);
        assert.equal(vastCreativeCompanionAd.getType(), VastCompanionAdType.IFRAME);
        assert.equal(vastCreativeCompanionAd.getIframeResourceURL(), 'https://search.spotxchange.com/banner?_a=235398&_p=spotx&_z=1&_m=eNp9Tk1rwzAM9f6Kz8WVbMexAztspIdCayhrGeRSnI9C0qQJSQqBrr998xoGO1VCgvckvSfJAAghGCjQ2ghUJA1TbULIDQeFWBiHOsMc4GRUCACCcBEIo8nhg2DIWaCYkIxLIOn1ktdFtFxmbcOa8lJmddmx1A3nYkxdXQ%2Bj6wdiD5uNl5CoBXmZ0aMh%2BfZBQg4Tcg0eP%2BgbPbVel0Zjfy0WNHejo9GNzl7H0g%2FoMzu6oK7rjsPY9vO2nIn%2F94iBESqQ9H7%2Fe%2BU34WtbvQnbrOW22k127%2BtzNdl4J5M4w2RfVzZeCxu%2Fn5Nm9foDZQZgPw%3D%3D&_l=eNp1kEtrAkEQhPu37NUgPY%2Beh5BLUCTBKAlq0IvMzsyqG3dXdAWD8b9nQA%2B5SEP3oaq%2BhmKGCU4CtFWIqIFAk5IgORkDwIBJNFJyhOO%2Bac%2FQ6QDnAuqmjoBwyUTWu2T5NmS9DLspL5mUWqEiTIDsKdu7n%2BbU3lWygpFBQxw5qqQe97F%2BHD3lu61fxbPfuHodV0WMdytikv3p4NoYVpU7fMd2v3M%2BPvBerzCejUa3Bdg18Dl9gaOrW1fEbnNYg3XWBKG0kDrkggdkxgZTSOdCbrXjt06U4oYzIE%2Fp%2BEIUushD8Ew5FaygG58LyYz49xDTJBwxmZLW6UDG%2BVSqEC6EoHLKA%2FxOhoPze%2FkhFl%2FzzZjPaFGGajycl5P%2BvFz213w5fauW01daVIPnPwJzcQg%3D&_t=eNpFkF1LwzAUhvtbci2apGnXRrxQ%2FMCLdSgDUYRympy2waYpbabTuf9uuinmJnme9xx4SQV9j2NULZALmoqc05QxzIFlimlK6zxdUErjSLVg%2BsiNDfRGRdVxa0csagOl0USSrK4zzBKsGQUdVzrXKuZCCMW4RqSCnJDajRZ8mL27vw1ojcXSfw4YjLHQ4OtZY%2BoQfBjt2yBjSgO1aJp23uLJAb3tSuXs0KHFfvZBGqhKYzcB5kYbW46oPPRNhyGcEEbVltOAisgdGWAEix7HaSaN70bh%2FMKtn69pcH5bHnUJw%2FDbkO9DYaexI1KcEBd2k304UcROKY1ApnI3SSGJMv6TnBtJzycZS6It%2FNEihG7T%2B%2FGQcx4Hl0rSdK6C7m8oiMFN%2Fl%2FEh7850j5iWZ4w8V1c3ySrp%2FuP5bp7W17fxMuvwrysH81qfZkUdw%2Fb4qt4W62vumf%2BcPEDqPqVsw%3D%3D&_b=eNozYLDQT9O3SEuzSLUwTU0zNEhMMU5KsUxJNjYyMTFJNjRKSU01MNHLKMnNYfAL9fFBEDW%2BIYEGvlmuhn4hgcZRLumVvu6hRlFZKdmRIemGkSFBmb5ZvgaRIU7ZflW%2BtgD3%2BB68&resource_type=iframe');
    });
});
