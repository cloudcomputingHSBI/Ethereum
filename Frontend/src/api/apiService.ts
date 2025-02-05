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

// Benutzerliste abrufen (für restricted elections)
export const getUsers = async (): Promise<any> => {
  const response = await apiClient.get('/users/allUsers');
  return response.data;
};

// Wahl speichern (mit access_type und allowedUsers)
export const saveForm = async (
  name: string,
  description: string,
  formData: any,
  startdate: Date,
  enddate: Date,
  accessType: 'open' | 'restricted',
  allowedUsers?: number[]
): Promise<void> => {
  const response = await apiClient.post('/api/createElection', {
    name,
    description,
    formData,
    startdate,
    enddate,
    access_type: accessType,
    allowedUsers: accessType === 'restricted' ? allowedUsers : undefined,
  });
  return response.data;
};

export const getElectionDetails = async (electionId: number): Promise<any> => {
  const response = await apiClient.get<any>(`/api/elections/${electionId}/details`);
  return response.data.election;
};