import axiosInstance from './axiosInstance';

export const getUserCount = () =>
    axiosInstance.get('/user/count');

export const createCompany = (data: any) =>
    axiosInstance.post('/company', data);

export const createBranch = (data: any) =>
    axiosInstance.post('/branches', data);

export const createDepartment = (data: any) =>
    axiosInstance.post('/department', data);

export const createRoleAccess = (data: any) =>
    axiosInstance.post('/role-access', data);

export const createEmployee = (data: any) =>
    axiosInstance.post('/user', data);

export const getCountries = () =>
    axiosInstance.get('/location/countries');

export const getStates = (countryId: string) =>
    axiosInstance.get(`/location/states/${countryId}`);

export const getCities = (stateId: string) =>
    axiosInstance.get(`/location/cities/${stateId}`);
