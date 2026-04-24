import axiosInstance from './axiosInstance';

export const getInventorySummary = (params: any) => axiosInstance.get('/vehicle-inventory/summary', { params });
export const getInventoryDetails = (params: any) => axiosInstance.get('/vehicle-inventory/details', { params });
export const getInventoryCounts = (params: any) => axiosInstance.get('/vehicle-inventory/counts', { params });
