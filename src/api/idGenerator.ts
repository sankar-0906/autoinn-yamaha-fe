import axios from './axiosInstance';

export const getIdGenerators = () => axios.get('/id-generator');
export const getIdGeneratorById = (id: string) => axios.get(`/id-generator/${id}`);
export const createIdGenerator = (data: any) => axios.post('/id-generator', data);
export const updateIdGenerator = (id: string, data: any) => axios.put(`/id-generator/${id}`, data);
export const deleteIdGenerator = (id: string) => axios.delete(`/id-generator/${id}`);
