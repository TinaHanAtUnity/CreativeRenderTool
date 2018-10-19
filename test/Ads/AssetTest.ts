import 'mocha';
import { assert } from 'chai';
import { Image } from 'Ads/Models/Assets/Image';
import { TestFixtures } from '../TestHelpers/TestFixtures';

describe('AssetTest', () => {
    it('should serialize Image model', () => {
        const url: string = 'https://test/url';
        const image: Image = new Image(url, TestFixtures.getSession());

        const rawData: string = image.toJSON();

        const parsedData = JSON.parse(rawData);

        assert.equal(parsedData.url, url, 'Image model url was not correctly serialized');
        assert.isUndefined(parsedData.session, 'Image model session was not ignored when serializing');
    });
});
