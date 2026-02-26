import axiosInstance from './axiosInstance';

export const getEmployees = async () => {
    const response = await axiosInstance.get('/employee');
    return response.data;
};

export const getEmployeeById = async (id: string) => {
    const response = await axiosInstance.get(`/employee/${id}`);
    return response.data;
};

export const getEmployeeCount = async () => {
    const response = await axiosInstance.get('/employee/count');
    return response.data;
};

export const createEmployee = async (data: any) => {
    const response = await axiosInstance.post('/employee', data);
    return response.data;
};

export const updateEmployee = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/employee/${id}`, data);
    return response.data;
};

export const deleteEmployee = async (id: string) => {
    const response = await axiosInstance.delete(`/employee/${id}`);
    return response.data;
};
