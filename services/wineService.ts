import { Wine } from '../types';

export const fetchWines = async (): Promise<Wine[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    const response = await fetch('/api/wines', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro ao buscar adega (HTTP ${response.status})`);
    }
    const wines = await response.json();
    return wines;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Falha ao buscar vinhos:', error);
    throw new Error('Não foi possível conectar à adega.');
  }
};
