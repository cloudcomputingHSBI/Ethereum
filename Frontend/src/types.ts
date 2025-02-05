export interface Election {
  election_id: number;
  name: string;
  description?: string;
  form_schema?: object;
  created_by?: number;
  created_at?: string;
  start_date?: string;
  end_date?: string;
  status?: string; 
  blockchain_id: number;
  access_type: 'open' | 'restricted'; 
  allowedUsers?: number[];
  results?: {
    candidatesArray: string[];
    votes: { [key: string]: number };
    voters: string[];
  }; 
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  is_verified?: boolean;
  registered_at?: string;
}
