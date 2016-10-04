import 'mocha';
import * as sinon from 'sinon';
import { assert } from 'chai';

import { EndScreen } from 'Views/EndScreen';
import { NativeBridge } from 'Native/NativeBridge';
import { Campaign } from 'Models/Campaign';
import EndScreenFixture from 'EndScreenFixture.html';

describe('EndScreen', () => {
    it('should render', () => {
        let handleInvocation = sinon.spy();
        let handleCallback = sinon.spy();
        let nativeBridge = new NativeBridge({
            handleInvocation,
            handleCallback
        });

        let endScreen = new EndScreen(nativeBridge, new Campaign({
            'appStoreId': 'com.nextgames.android.twd',
            'bypassAppSheet': false,
            'endScreenLandscape': 'http://cdn-highwinds.unityads.unity3d.com/impact/images/67054/af4b66f6e62b7bea/new-endcard-600x800.jpg',
            'endScreenPortrait': 'http://cdn-highwinds.unityads.unity3d.com/impact/images/67054/dea8584ee0e82f7c/new-endcard.jpg',
            'gameIcon': 'https://static.applifier.com/game-icons/VJv1HzG3b.png',
            'gameId': 67054,
            'gameName': 'The Walking Dead No Man\\\'s Land',
            'id': '57ebb8b37d06ea790037cf7d',
            'rating': '4.500000',
            'ratingCount': 290910,
            'trailerDownloadable': 'http://cdn-highwinds.unityads.unity3d.com/impact/videos/67054/3f824a9bcb2ed2bc/michonne-gameplay-new/m31-1000.mp4',
            'trailerDownloadableSize': 1762313,
            'trailerStreaming': 'http://cdn-highwinds.unityads.unity3d.com/impact/videos/67054/3f824a9bcb2ed2bc/michonne-gameplay-new/b30-400.mp4'
        }, '', 0), true);

        endScreen.render();

        assert.equal(endScreen.container().innerHTML, EndScreenFixture);
    });
});
