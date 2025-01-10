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
