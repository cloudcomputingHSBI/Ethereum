import apiClient from './index';

export interface Election {
  election_id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  is_public: boolean;
}

// Funktion: Wahlen abrufen
export const getAccessibleElections = async (): Promise<Election[]> => {
  const response = await apiClient.get<Election[]>('/api/elections');
  return response.data;
};

export const getElectionResults = async (electionId: number): Promise<string> => {
    const response = await apiClient.get<string>(`/api/elections/${electionId}/results`);
    return response.data;
  };

export const saveForm = async (name: string, description: string, formData : any, password : string, startdate : Date, enddate : Date): Promise<void> => {
  const response = await apiClient.post('/api/createElection', {
    name,
    description,
    formData,
    password,
    startdate,
    enddate
  });
  return response.data;
}