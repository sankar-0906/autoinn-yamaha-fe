import axiosInstance from './axiosInstance';

export const getDepartments = (params?: any) =>
    axiosInstance.get('/department', { params }).then(res => res.data);

export const getDepartmentById = (id: string) =>
    axiosInstance.get(`/department/${id}`).then(res => res.data);

export const createDepartment = (data: any) =>
    axiosInstance.post('/department', data).then(res => res.data);

export const updateDepartment = (id: string, data: any) =>
    axiosInstance.put(`/department/${id}`, data).then(res => res.data);

export const deleteDepartment = (id: string) =>
    axiosInstance.delete(`/department/${id}`).then(res => res.data);
