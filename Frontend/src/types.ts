export interface Election {
    election_id: number;
    name: string;
    description?: string;
    form_schema?: object;
    created_by?: number;
    created_at?: string;
    start_date?: string;
    end_date?: string;
    password?: string;
    status?: string; 
    blockchain_id: number;
  }