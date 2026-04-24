import axiosInstance from './axiosInstance';

export const uploadImage = (formData: FormData) => {
    return axiosInstance.post('/upload/image', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};
