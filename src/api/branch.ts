import axiosInstance from './axiosInstance';

export const getBranches = async () => {
    const response = await axiosInstance.get('/branches');
    return response.data;
};

export const getBranchById = async (id: string) => {
    const response = await axiosInstance.get(`/branches/${id}`);
    return response.data;
};

export const createBranch = async (data: any) => {
    const response = await axiosInstance.post('/branches', data);
    return response.data;
};

export const updateBranch = async (id: string, data: any) => {
    const response = await axiosInstance.put(`/branches/${id}`, data);
    return response.data;
};

export const deleteBranch = async (id: string) => {
    const response = await axiosInstance.delete(`/branches/${id}`);
    return response.data;
};
