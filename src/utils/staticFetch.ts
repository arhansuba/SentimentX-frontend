export const fetchStaticAsset = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      // No credentials or cookies
      credentials: 'omit',
      // No extra headers
      headers: {}
    });
    return response;
  } catch (error) {
    console.error('Failed to fetch static asset:', error);
    throw error;
  }
};
