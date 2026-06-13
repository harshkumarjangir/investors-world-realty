const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function getProperties(params = {}) {
  const query = new URLSearchParams();
  
  if (params.location) query.append('location', params.location);
  if (params.minPrice) query.append('minPrice', params.minPrice);
  if (params.maxPrice) query.append('maxPrice', params.maxPrice);
  if (params.type) query.append('type', params.type);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit);

  const queryString = query.toString() ? `?${query.toString()}` : '';

  try {
    // Force dynamic fetching in dev to see changes immediately, but allow revalidation in prod
    const res = await fetch(`${API_BASE_URL}/properties${queryString}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch properties: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error("Error fetching properties:", error);
    return { data: [], totalItems: 0, page: 1, pageSize: 10 };
  }
}

export async function getPropertyById(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/properties/${id}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch property ${id}: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching property ${id}:`, error);
    return { data: null };
  }
}
