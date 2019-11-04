import { InterstitialWebPlayerContainer as Base} from 'Ads/Utilities/WebPlayer/InterstitialWebPlayerContainer';

export type InterstitialWebPlayerContainerMock = Base & {
};

export const InterstitialWebPlayerContainer = jest.fn(() => {
    return <InterstitialWebPlayerContainerMock>{};
});
