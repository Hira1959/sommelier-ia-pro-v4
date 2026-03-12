import { Wine, PairingSuggestion } from '../types';

export const getWinePairing = async (dish: string, wines: Wine[], excludedWineIds: string[] = []): Promise<PairingSuggestion[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  try {
    const response = await fetch('/api/pairings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dish, excludedWineIds }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) throw new Error("Falha na api de harmonizações.");
    return await response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Pairing Error:", error);
    throw new Error(error.message || "Ocorreu um erro ao buscar harmonizações.");
  }
};

export const generateDishImages = async (dishName: string, count: number = 3): Promise<string[]> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
  try {
    const response = await fetch('/api/images', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dishName, count }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Image Generation Error:", error);
    return [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop'
    ];
  }
};
