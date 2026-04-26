import axios from './axiosInstance';

export const getIdGenerators = (params?: any) => axios.get('/id-generator', { params }).then(res => res.data);
export const getIdGeneratorById = (id: string) => axios.get(`/id-generator/${id}`).then(res => res.data);
export const createIdGenerator = (data: any) => axios.post('/id-generator', data).then(res => res.data);
export const updateIdGenerator = (id: string, data: any) => axios.put(`/id-generator/${id}`, data).then(res => res.data);
export const deleteIdGenerator = (id: string) => axios.delete(`/id-generator/${id}`).then(res => res.data);
