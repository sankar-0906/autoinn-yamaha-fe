import axiosInstance from './axiosInstance';

export const getDealers = () => axiosInstance.get('/dealer');
export const getDealerById = (id: string) => axiosInstance.get(`/dealer/${id}`);
export const createDealer = (data: any) => axiosInstance.post('/dealer', data);
export const updateDealer = (id: string, data: any) => axiosInstance.put(`/dealer/${id}`, data);
export const deleteDealer = (id: string) => axiosInstance.delete(`/dealer/${id}`);
