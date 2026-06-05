import axiosClient from '../http/axiosClient';

export const userAPI = {
  async profile() {
    const { data } = await axiosClient.get('/api/users/me');
    console.log(data);
    // return {
    //   // username: data.username,
    //   // institution: data.institution,
    //   // email: data.email,
    // };
    return data;
  },
};
