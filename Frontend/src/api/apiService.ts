import apiClient from './index';
import { Election } from '../types';

// Funktion: Wahlen abrufen
export const getAccessibleElections = async (): Promise<Election[]> => {
  const response = await apiClient.get<Election[]>('/api/elections');
  return response.data;
};

// Funktion: Public Wallet Address abrufen
export const getPublicWallet = async (): Promise<any> => {
  const response = await apiClient.get<any>('/api/getPublicWallet');
  return response.data.wallet_address;
};

export const getElectionResults = async (electionId: number): Promise<{ name: string; voteCount: string }[] | null> => {
  try {
    const response = await apiClient.get(`/api/elections/${electionId}/results`);
    
    // Überprüfe, ob das Ergebnis tatsächlich ein Array ist
    if (!Array.isArray(response.data.results)) {
      console.error("❌ API hat ein unerwartetes Ergebnis zurückgegeben:", response.data);
      return null;
    }

    return response.data.results; // Ergebnisse zurückgeben
  } catch (error) {
    console.error("❌ Fehler beim Abrufen der Wahlergebnisse:", error);
    return null;
  }
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