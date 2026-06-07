import axiosClient from '../http/axiosClient';

export const graphAPI = {
  async searchGraph(keyword) {
    const { data } = await axiosClient.get('/api/v1/papers/search/graph', {
      params: { keyword },
    });
    console.log(data.data);

    return data.data;
  },
};
