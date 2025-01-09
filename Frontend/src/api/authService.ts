import apiClient from './index';

// Typen für die Anfrage und Antwort
export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  message: string;
  userId?: number;
}

// Benutzer registrieren
export const registerUser = async (data: RegisterUserRequest): Promise<RegisterUserResponse> => {
  try {
    const response = await apiClient.post<RegisterUserResponse>('/registerUser', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler bei der Registrierung');
  }
};

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface LoginUserResponse {
  message: string;
  token: string; 
}

// Benutzer einloggen
export const loginUser = async (data: LoginUserRequest): Promise<LoginUserResponse> => {
  try {
    const response = await apiClient.post<LoginUserResponse>('/loginUser', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Fehler beim Login');
  }
};