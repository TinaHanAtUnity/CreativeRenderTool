import 'mocha';
import { assert } from 'chai';

import { Campaign } from 'Models/Campaign';
import { VastCampaign } from 'Models/Vast/VastCampaign';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('Campaign', () => {

    describe('when created with campaign json', () => {
        it('should have correct data from the json', () => {
            let json = {
                'abGroup': 3,
                'campaign': {
                    'appStoreId': '12345678',
                    'bypassAppSheet': false,
                    'endScreenLandscape': 'dummyEndScreenLandscape',
                    'endScreenPortrait': 'dummyEndScreenPortrait',
                    'gameIcon': 'dummyGameIcon',
                    'gameId': 1234,
                    'gameName': 'dummyGameName',
                    'id': '12345',
                    'rating': '5',
                    'ratingCount': '123456',
                    'trailerDownloadable': 'dummyTrailerDownloadable',
                    'trailerDownloadableSize': 123,
                    'trailerStreaming': 'dummyTrailerStreaming',
                },
                'gamerId': '5712983c481291b16e1be03b'
            };
            let campaign = new Campaign(json.campaign, json.gamerId, json.abGroup);
            assert.equal(campaign.getAbGroup(), json.abGroup);
            assert.equal(campaign.getGamerId(), json.gamerId);
            assert.equal(campaign.getAppStoreId(), json.campaign.appStoreId);
            assert.equal(campaign.getLandscapeUrl(), json.campaign.endScreenLandscape);
            assert.equal(campaign.getPortraitUrl(), json.campaign.endScreenPortrait);
            assert.equal(campaign.getGameIcon(), json.campaign.gameIcon);
            assert.equal(campaign.getGameId(), json.campaign.gameId);
            assert.equal(campaign.getGameName(), json.campaign.gameName);
            assert.equal(campaign.getId(), json.campaign.id);
            assert.equal(campaign.getRating(), json.campaign.rating);
            assert.equal(campaign.getRatingCount(), json.campaign.ratingCount);
        });
    });

    describe('when created with VAST json', () => {
        it('should have correct data from the json', () => {
            let vastXml = `<?xml version="1.0" encoding="UTF-8"?>
                            <VAST version="2.0">
                              <Ad id="preroll-1">
                                <InLine>
                                  <AdSystem>2.0</AdSystem>
                                  <AdTitle>5748406</AdTitle>
                                  <Impression id="blah"><![CDATA[http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130]]></Impression>
                                  <Creatives>
                                    <Creative>
                                      <Linear>
                                        <Duration>00:00:30</Duration>
                                        <TrackingEvents>
                                            <Tracking event="start"><![CDATA[http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%]]></Tracking>
                                        </TrackingEvents>
                                        <VideoClicks>
                                          <ClickThrough id="scanscout"><![CDATA[http://www.target.com]]></ClickThrough>
                                        </VideoClicks>
                                        <MediaFiles>
                                            <MediaFile height="396" width="600" bitrate="496" type="video/mp4" delivery="progressive"><![CDATA[http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4]]></MediaFile>
                                        </MediaFiles>
                                      </Linear>
                                </Creative>
                                <Creative>
                                      <CompanionAds>
                                        <Companion height="250" width="300" id="555750">
                                          <HTMLResource><![CDATA[<A onClick="var i= new Image(1,1); i.src='http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=0&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true';" HREF="http://target.com" target="_blank">
                            <IMG SRC="http://media.scanscout.com/ads/target300x250Companion.jpg" BORDER=0 WIDTH=300 HEIGHT=250 ALT="Click Here">
                            </A>
                            <img src="http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=1&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true" height="1" width="1">
                            ]]></HTMLResource>
                                        </Companion>
                                      </CompanionAds>
                                    </Creative>
                                  </Creatives>
                                </InLine>
                              </Ad>
                            </VAST>`;
            let vastParser = TestFixtures.getVastParser();
            let parsedVast = vastParser.parseVast(vastXml);
            let campaign = new VastCampaign(parsedVast, '12345', 'gamerId', 1);
            assert.equal(campaign.getAbGroup(), 1);
            assert.equal(campaign.getGamerId(), 'gamerId');
            assert.equal(campaign.getAppStoreId(), null);
            assert.equal(campaign.getLandscapeUrl(), null);
            assert.equal(campaign.getPortraitUrl(), null);
            assert.equal(campaign.getGameIcon(), null);
            assert.equal(campaign.getGameId(), null);
            assert.equal(campaign.getGameName(), null);
            assert.equal(campaign.getId(), '12345');
            assert.equal(campaign.getRating(), null);
            assert.equal(campaign.getRatingCount(), null);
            const vast = campaign.getVast();
            assert.equal(1, vast.getAds().length);
            assert.deepEqual(vast.getImpressionUrls(), [
                'http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130'
            ], 'impression urls');
            assert.deepEqual(vast.getTrackingEventUrls('start'), [
                'http://localhost:3500/brands/14851/start?advertisingTrackingId=123456&androidId=aae7974a89efbcfd&creativeId=CrEaTiVeId1&demandSource=tremor&gameId=14851&ip=192.168.69.69&token=9690f425-294c-51e1-7e92-c23eea942b47&ts=2016-04-21T20%3A46%3A36Z&value=13.1&zone=%ZONE%'
            ], 'start tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('firstQuartile'), [], 'first quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('midpoint'), [], 'midpoint tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('thirdQuartile'), [], 'third quartile tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('complete'), [], 'complete tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('mute'), [], 'mute tracking event urls');
            assert.deepEqual(vast.getTrackingEventUrls('unmute'), [], 'unmute tracking event urls');
            assert.equal(vast.getVideoUrl(), 'http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4', 'video url');
            assert.equal(vast.getDuration(), 30, 'duration');
            assert.deepEqual(vast.getErrorURLTemplates(), [], 'error urls');
        });

        it('should return cached video url when set', () => {
            let vastXml = `<?xml version="1.0" encoding="UTF-8"?>
                            <VAST version="2.0">
                              <Ad id="preroll-1">
                                <InLine>
                                  <AdSystem>2.0</AdSystem>
                                  <AdTitle>5748406</AdTitle>
                                  <Impression id="blah"><![CDATA[http://b.scorecardresearch.com/b?C1=1&C2=6000003&C3=0000000200500000197000000&C4=us&C7=http://www.scanscout.com&C8=scanscout.com&C9=http://www.scanscout.com&C10=xn&rn=-103217130]]></Impression>
                                  <Creatives>
                                    <Creative>
                                      <Linear>
                                        <Duration>00:00:30</Duration>
                                        <TrackingEvents>
                                        </TrackingEvents>
                                        <VideoClicks>
                                          <ClickThrough id="scanscout"><![CDATA[http://www.target.com]]></ClickThrough>
                                        </VideoClicks>
                                        <MediaFiles>
                                            <MediaFile height="396" width="600" bitrate="496" type="video/mp4" delivery="progressive"><![CDATA[http://static.applifier.com/impact/videos/104090/e97394713b8efa50/1602-30s-v22r3-seven-knights-character-select/m31-1000.mp4]]></MediaFile>
                                        </MediaFiles>
                                      </Linear>
                                </Creative>
                                <Creative>
                                      <CompanionAds>
                                        <Companion height="250" width="300" id="555750">
                                          <HTMLResource><![CDATA[<A onClick="var i= new Image(1,1); i.src='http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=0&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true';" HREF="http://target.com" target="_blank">
                            <IMG SRC="http://media.scanscout.com/ads/target300x250Companion.jpg" BORDER=0 WIDTH=300 HEIGHT=250 ALT="Click Here">
                            </A>
                            <img src="http://app.scanscout.com/ssframework/log/log.png?a=logitemaction&RI=555750&CbC=1&CbF=true&EC=1&RC=0&SmC=2&CbM=1.0E-5&VI=736e6b13bad531dc476bc3612749bc35&admode=preroll&PRI=-4827170214961170629&RprC=0&ADsn=17&VcaI=192,197&RrC=1&VgI=736e6b13bad531dc476bc3612749bc35&AVI=142&Ust=ma&Uctry=us&CI=1223187&AC=4&PI=567&Udma=506&ADI=5748406&VclF=true" height="1" width="1">
                            ]]></HTMLResource>
                                        </Companion>
                                      </CompanionAds>
                                    </Creative>
                                  </Creatives>
                                </InLine>
                              </Ad>
                            </VAST>`;
            let vastParser = TestFixtures.getVastParser();
            let parsedVast = vastParser.parseVast(vastXml);
            let campaign = new Campaign({vast: parsedVast}, 'gamerId', 1);
            campaign.setVideoUrl('file://some/cache/path.mp4');
            assert.equal(campaign.getVideoUrl(), 'file://some/cache/path.mp4');
        });
    });
});
