import 'mocha';
import { assert } from 'chai';
import { LimitedTimeOffer, ILimitedTimeOfferData } from 'Promo/Models/LimitedTimeOffer';

describe('LimitedTimeOffer', () => {
    describe('isExpired', () => {
        const oneHourInSeconds = 3600;
        const twoHoursInSeconds = 7200;
        context('where first impression is not set', () => {
            it('should return true', () => {
                const limitedTimeOfferData: ILimitedTimeOfferData = {
                    duration: twoHoursInSeconds,
                    firstImpression: undefined
                };
                const limitedTimeOffer = new LimitedTimeOffer(limitedTimeOfferData);
                assert.equal(limitedTimeOffer.getDuration(), twoHoursInSeconds);
                assert.isUndefined(limitedTimeOffer.getFirstImpression());
                assert.isTrue(limitedTimeOffer.isExpired());
            });
        });

        context('where first impression is set', () => {
            it('where current date exceeds first impression + duration should return false', () => {
                const oneHourBehindCurrentDate = new Date();
                oneHourBehindCurrentDate.setSeconds(oneHourBehindCurrentDate.getSeconds() - oneHourInSeconds);
                const limitedTimeOfferData: ILimitedTimeOfferData = {
                    duration: twoHoursInSeconds,
                    firstImpression: oneHourBehindCurrentDate
                };
                const limitedTimeOffer = new LimitedTimeOffer(limitedTimeOfferData);
                assert.equal(limitedTimeOffer.getDuration(), twoHoursInSeconds);
                assert.isDefined(limitedTimeOffer.getFirstImpression());
                assert.isFalse(limitedTimeOffer.isExpired());
            });

            it('where current date does not exceed first impression + duration should return true', () => {
                const twoHoursBehindCurrentDate = new Date();
                twoHoursBehindCurrentDate.setSeconds(twoHoursBehindCurrentDate.getSeconds() - twoHoursInSeconds);
                const limitedTimeOfferData: ILimitedTimeOfferData = {
                    duration: oneHourInSeconds,
                    firstImpression: twoHoursBehindCurrentDate
                };
                const limitedTimeOffer = new LimitedTimeOffer(limitedTimeOfferData);
                assert.equal(limitedTimeOffer.getDuration(), oneHourInSeconds);
                assert.isDefined(limitedTimeOffer.getFirstImpression());
                assert.isTrue(limitedTimeOffer.isExpired());
            });
        });
    });
});
