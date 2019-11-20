import { Analytics as Base } from 'Analytics/Analytics';

export type AnalyticsMock = Base & {};

export const Analytics = jest.fn(() => {
    return <AnalyticsMock>{};
});
