import axiosInstance from './axiosInstance';

export const getParts = (params?: any) => axiosInstance.get('/parts-master', { params }).then(res => res.data);
export const getPartById = (id: string) => axiosInstance.get(`/parts-master/${id}`).then(res => res.data);
export const createPart = (data: any) => axiosInstance.post('/parts-master', data).then(res => res.data);
export const updatePart = (id: string, data: any) => axiosInstance.put(`/parts-master/${id}`, data).then(res => res.data);
export const deletePart = (id: string) => axiosInstance.delete(`/parts-master/${id}`).then(res => res.data);
