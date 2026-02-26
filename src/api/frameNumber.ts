import axios from './axiosInstance';

export const getFrameNumbers = () => axios.get('/frame-number');
export const getFrameNumberById = (id: string) => axios.get(`/frame-number/${id}`);
export const createFrameNumber = (data: any) => axios.post('/frame-number', data);
export const updateFrameNumber = (id: string, data: any) => axios.put(`/frame-number/${id}`, data);
export const deleteFrameNumber = (id: string) => axios.delete(`/frame-number/${id}`);
