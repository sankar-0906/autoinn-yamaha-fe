import axiosInstance from './axiosInstance';

export const getCountries = () => axiosInstance.get('/location/countries');
export const getStates = (countryId: string) => axiosInstance.get(`/location/states/${countryId}`);
export const getCities = (stateId: string) => axiosInstance.get(`/location/cities/${stateId}`);
