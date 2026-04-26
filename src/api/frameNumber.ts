import axios from './axiosInstance';

export const getFrameNumbers = (params?: any) => axios.get('/frame-number', { params }).then(res => res.data);
export const getFrameNumberById = (id: string) => axios.get(`/frame-number/${id}`).then(res => res.data);
export const createFrameNumber = (data: any) => axios.post('/frame-number', data).then(res => res.data);
export const updateFrameNumber = (id: string, data: any) => axios.put(`/frame-number/${id}`, data).then(res => res.data);
export const deleteFrameNumber = (id: string) => axios.delete(`/frame-number/${id}`).then(res => res.data);
