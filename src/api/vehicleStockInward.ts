import axiosInstance from './axiosInstance';

export const getVehicleStockInwards = () => axiosInstance.get('/vehicle-stock-inward');
export const getVehicleStockInwardById = (id: string) => axiosInstance.get(`/vehicle-stock-inward/${id}`);
export const processInwardPdf = (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return axiosInstance.post('/vehicle-stock-inward/process-pdf', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
export const createVehicleStockInward = (data: any) => axiosInstance.post('/vehicle-stock-inward', data);
