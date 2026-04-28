import axiosInstance from './axiosInstance';

export const getVehicleStockInwards = () => axiosInstance.get('/vehicle-stock-inward');
export const getVehicleStockInwardById = (id: string) => axiosInstance.get(`/vehicle-stock-inward/${id}`);
export const processInwardPdf = (file: File) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return axiosInstance.post('/vehicle-stock-inward/process-pdf', formData, {
        timeout: 10000, // Reduced timeout since we get immediate response
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getInwardPdfJobStatus = (jobId: string) => 
    axiosInstance.get(`/vehicle-stock-inward/job/${jobId}`);
export const createVehicleStockInward = (data: any) => axiosInstance.post('/vehicle-stock-inward', data);
export const updateVehicleStockInward = (id: string, data: any) => axiosInstance.put(`/vehicle-stock-inward/${id}`, data);
export const deleteVehicleStockInward = (id: string) => axiosInstance.delete(`/vehicle-stock-inward/${id}`);
export const lookupVehicleImage = (modelCode: string, colorCode: string) =>
    axiosInstance.get(`/vehicle-stock-inward/lookup-image?modelCode=${modelCode}&colorCode=${colorCode}`);
