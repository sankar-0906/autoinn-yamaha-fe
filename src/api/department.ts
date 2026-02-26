import axiosInstance from './axiosInstance';

export const getDepartments = (params?: any) =>
    axiosInstance.get('/department', { params });

export const getDepartmentById = (id: string) =>
    axiosInstance.get(`/department/${id}`);

export const createDepartment = (data: any) =>
    axiosInstance.post('/department', data);

export const updateDepartment = (id: string, data: any) =>
    axiosInstance.put(`/department/${id}`, data);

export const deleteDepartment = (id: string) =>
    axiosInstance.delete(`/department/${id}`);
