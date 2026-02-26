import axiosInstance from './axiosInstance';

export const getManufacturers = async () => {
    const response = await axiosInstance.get('/manufacturer');
    return response.data;
};

export const getManufacturerById = async (id: string) => {
    const response = await axiosInstance.get(`/manufacturer/${id}`);
    return response.data;
};

export const createManufacturer = async (data: any) => {
    const response = await axiosInstance.post('/manufacturer', data);
    return response.data;
};

export const updateManufacturer = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/manufacturer/${id}`, data);
    return response.data;
};

export const deleteManufacturer = async (id: string) => {
    const response = await axiosInstance.delete(`/manufacturer/${id}`);
    return response.data;
};
