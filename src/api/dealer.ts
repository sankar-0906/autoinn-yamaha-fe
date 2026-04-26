import axiosInstance from './axiosInstance';

export const getDealers = (params?: any) => axiosInstance.get('/dealer', { params }).then(res => res.data);
export const getDealerById = (id: string) => axiosInstance.get(`/dealer/${id}`).then(res => res.data);
export const createDealer = (data: any) => axiosInstance.post('/dealer', data).then(res => res.data);
export const updateDealer = (id: string, data: any) => axiosInstance.put(`/dealer/${id}`, data).then(res => res.data);
export const deleteDealer = (id: string) => axiosInstance.delete(`/dealer/${id}`).then(res => res.data);
