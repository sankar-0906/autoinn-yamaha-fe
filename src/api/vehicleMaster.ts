import axiosInstance from './axiosInstance';

export const getVehicles = (params?: any) => axiosInstance.get('/vehicle-master', { params }).then(res => res.data);
export const getVehicleById = (id: string) => axiosInstance.get(`/vehicle-master/${id}`).then(res => res.data);
export const createVehicle = (data: any) => axiosInstance.post('/vehicle-master', data).then(res => res.data);
export const updateVehicle = (id: string, data: any) => axiosInstance.put(`/vehicle-master/${id}`, data).then(res => res.data);
export const deleteVehicle = (id: string) => axiosInstance.delete(`/vehicle-master/${id}`).then(res => res.data);
export const getUniqueModels = () => axiosInstance.get('/vehicle-master/models').then(res => res.data);
export const getColorsByModel = (modelCode: string) => axiosInstance.get(`/vehicle-master/colors/${modelCode}`).then(res => res.data);
