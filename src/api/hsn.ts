import axiosInstance from './axiosInstance';

export const getHsns = () => {
    return axiosInstance.get('/hsn');
};

export const createHsn = (data: any) => {
    return axiosInstance.post('/hsn', data);
};

export const updateHsn = (id: string, data: any) => {
    return axiosInstance.put(`/hsn/${id}`, data);
};

export const deleteHsn = (id: string) => {
    return axiosInstance.delete(`/hsn/${id}`);
};
