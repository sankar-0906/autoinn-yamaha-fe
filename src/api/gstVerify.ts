import axiosInstance from './axiosInstance';

export const verifyGST = (gst: string) => {
    return axiosInstance.post('/gstVerify', { gst });
};
