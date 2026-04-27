import axios from 'axios';

export function getAdminErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 403) {
    return 'You do not have permission to perform this admin action.';
  }

  return error.response?.data?.errors?.[0] ?? fallback;
}
