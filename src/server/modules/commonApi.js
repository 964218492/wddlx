import http from '../index';
export const rechargeLimitCheck = () => {
  return http({
    url: `/memberStock/common/rechargeLimitCheck`,
    method: 'get'
  });
};