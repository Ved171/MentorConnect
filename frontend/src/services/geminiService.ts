import { Mentee, Mentor } from "../types";
import api from './api';

export const suggestMentors = async (mentee: Mentee): Promise<Mentor[]> => {
  try {
    const response = await api.post('/mentors/suggest', { menteeId: mentee.id });
    return response.data;
  } catch (error) {
    console.error("Error fetching mentor suggestions:", error);
    return [];
  }
};
