import { getMeResultSchema, type GetMeResult } from '@just-recordings/shared';
import config from '../config';
import { getToken } from '../services/supabase';

export const getMe = async (): Promise<GetMeResult> => {
  const tokenResponse = await getToken();

  if (!tokenResponse.success || !tokenResponse.token) {
    return {
      success: false,
      message: 'No token',
    };
  }

  const response = await fetch(`${config.apiBaseUrl}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenResponse.token}`,
    },
  });

  if (!response.ok) {
    return {
      success: false,
      message: `Failed with status ${response.status}`,
    };
  }

  const json = await response.json();
  return getMeResultSchema.parse({
    success: true,
    ...json,
  });
};
