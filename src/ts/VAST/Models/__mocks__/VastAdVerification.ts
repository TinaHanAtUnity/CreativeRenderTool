import { VastAdVerification as Base} from 'VAST/Models/VastAdVerification';

export type VastAdVerificationMock = Base & {
  getVerificationParameters: jest.Mock;
  getVerificationVendor: jest.Mock;
  getVerficationResources: jest.Mock;
};

export const VastAdVerification = jest.fn(() => {
  return <VastAdVerificationMock>{
    getVerificationParameters: jest.fn(),
    getVerificationVendor: jest.fn(),
    getVerficationResources: jest.fn()
  };
});
