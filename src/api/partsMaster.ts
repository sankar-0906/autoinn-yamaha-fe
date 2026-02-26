import axiosInstance from './axiosInstance';

export const getParts = () => axiosInstance.get('/parts-master');
export const getPartById = (id: string) => axiosInstance.get(`/parts-master/${id}`);
export const createPart = (data: any) => axiosInstance.post('/parts-master', data);
export const updatePart = (id: string, data: any) => axiosInstance.put(`/parts-master/${id}`, data);
export const deletePart = (id: string) => axiosInstance.delete(`/parts-master/${id}`);
