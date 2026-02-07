import axios from "axios";
import type { PR, PRCreate, PRUpdate, Milestone } from "./types";

const API_URL = "http://127.0.0.1:8000";

const client = axios.create({
  baseURL: API_URL,
});

// Request interceptor to add token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  register: async (username: string, password: string): Promise<string> => {
    const response = await client.post("/auth/register", {
      username,
      password,
    });
    return response.data.access_token;
  },

  login: async (username: string, password: string): Promise<string> => {
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("password", password);
    const response = await client.post("/auth/token", params, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data.access_token;
  },

  // Get all PRs
  getAll: async (): Promise<PR[]> => {
    const response = await client.get<PR[]>("/prs");
    return response.data;
  },

  // Create a new PR
  create: async (data: PRCreate): Promise<PR> => {
    const response = await client.post<PR>("/prs", data);
    return response.data;
  },

  // Delete a PR
  delete: async (id: number): Promise<void> => {
    await client.delete(`/prs/${id}`);
  },

  // Update a PR
  update: async (id: number, data: PRUpdate): Promise<PR> => {
    const response = await client.put<PR>(`/prs/${id}`, data);
    return response.data;
  },

  // Get all milestones
  getMilestones: async (): Promise<Milestone[]> => {
    const response = await client.get<Milestone[]>("/milestones");
    return response.data;
  },

  // Generate Workout Routine
  generateRoutine: async (data: {
    fitness_level: string;
    days_per_week: number;
    focus_areas?: string;
  }): Promise<{
    routine_name: string;
    coach_tip: string;
    schedule: {
      day: string;
      focus: string;
      exercises: {
        name: string;
        sets: string;
        reps: string;
        notes?: string;
      }[];
    }[];
  }> => {
    const response = await client.post("/ai/generate_routine", data);
    return response.data;
  },
};
