import apiClient from './index';
import { Election } from '../types';

// Funktion: Wahlen abrufen
export const getAccessibleElections = async (): Promise<Election[]> => {
  const response = await apiClient.get<Election[]>('/api/elections');
  return response.data;
};

export const getElectionResults = async (electionId: number): Promise<string> => {
    const response = await apiClient.get<string>(`/api/elections/${electionId}/results`);
    return response.data;
  };

export const saveForm = async (name: string, description: string, formData : any,  startdate : Date, enddate : Date, password : string): Promise<void> => {
  const response = await apiClient.post('/api/createElection', {
    name,
    description,
    formData,
    startdate,
    enddate,
    password
  });
  return response.data;
}

export const getElectionDetails = async (electionId: number, password?: string): Promise<Election> => {
  const response = await apiClient.post<Election>(`/api/elections/${electionId}/details`, {
    password,
  });
  return response.data;
};