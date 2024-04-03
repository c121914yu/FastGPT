import axios from 'axios';

export const pat2Token = (env: string, pat: string) => {
  return axios.post(`${env}/v1/auth/pat2token`, {
    pat: pat
  });
};

export const getLafProfile = (env: string, token: string) => {
  if (!token) return null;
  return axios.get(`${env}/v1/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getLafApplications = (env: string, token: string) => {
  return axios.get(`${env}/v1/applications`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};

export const getLafAppDetail = (env: string, token: string, appid: string) => {
  return axios.get(`${env}/v1/applications/${appid}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
};
