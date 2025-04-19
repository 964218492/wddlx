import http from '../index';
export const login = (params) => {
  return http({
    url: `/login`,
    method: 'post'
  }, params);
};