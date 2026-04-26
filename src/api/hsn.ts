import axiosInstance from './axiosInstance';

export const getHsns = async (params = {}) => {
    const response = await axiosInstance.post('/hsn/get', params);
    return response.data;
};

export const createHsn = async (data: any) => {
    const response = await axiosInstance.post('/hsn', data);
    return response.data;
};

export const updateHsn = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/hsn/${id}`, data);
    return response.data;
};

export const deleteHsn = async (id: string) => {
    const response = await axiosInstance.delete(`/hsn/${id}`);
    return response.data;
};
