import axiosInstance from './axiosInstance';

export const getVehicles = () => axiosInstance.get('/vehicle-master');
export const getVehicleById = (id: string) => axiosInstance.get(`/vehicle-master/${id}`);
export const createVehicle = (data: any) => axiosInstance.post('/vehicle-master', data);
export const updateVehicle = (id: string, data: any) => axiosInstance.put(`/vehicle-master/${id}`, data);
export const deleteVehicle = (id: string) => axiosInstance.delete(`/vehicle-master/${id}`);
