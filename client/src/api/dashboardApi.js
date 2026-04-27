import apiClient from './apiClient';

/**
 * GET /api/dashboard/stats
 * @returns {{ totals, byType, daily }}
 */
export const fetchStats = async () => {
  const response = await apiClient.get('/dashboard/stats');
  return response.data;
};

/**
 * GET /api/history
 * @param {{ page?, limit?, type?, result?, sort? }} params
 * @returns {{ data: ScanHistory[], pagination }}
 */
export const fetchHistory = async (params = {}) => {
  const response = await apiClient.get('/history', { params });
  return response;
};

/**
 * DELETE /api/history/:id
 */
export const deleteHistoryRecord = async (id) => {
  const { data } = await apiClient.delete(`/history/${id}`);
  return data;
};
