import apiClient from './apiClient';

/**
 * POST /api/scan/url
 * @param {string} url
 * @returns {{ prediction: string, riskScore: number, reasons: string[], data: { id: string, type: string, inputData: string }, threatIntel: object|null, timestamp: string }}
 */
export const scanUrl = async (url) => {
  const response = await apiClient.post('/scan/url', { url });
  return response;
};

/**
 * POST /api/scan/message
 * @param {string} message
 * @param {'email'|'sms'} type
 * @returns {{ id, type, inputData, prediction, riskScore, reasons, threatIntel, timestamp }}
 */
export const scanMessage = async (message, type = 'email') => {
  const response = await apiClient.post('/scan/message', { message, type });
  return response;
};
