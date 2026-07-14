const ID_TOKEN_KEY = 'idToken';
const API_BASE = "http://localhost:8080/api";

export const fetchWrapper = async (url: string, options: RequestInit = {}, baseUrl = API_BASE) => {
  // Get the token from localStorage
  const token = localStorage.getItem(ID_TOKEN_KEY);

  // Set up headers, including the Authorization header if the token exists
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : "",
  };

  // Merge options with headers
  const requestOptions = {
    ...options,
    headers,
  };

  const response = await fetch(baseUrl + url, requestOptions);

  if (response.status === 401) {
    // Clear tokens if any (optional)
    localStorage.clear();
    sessionStorage.clear();;
    // Redirect to the login page
    if (window) {
      window.location.href = "/login";
    }
    return; // Ensure no further execution
  }

  if (!response.ok) {
    const result = await response.json();// optional
    throw new Error(result && result.error || response.statusText);
  }

  return response.json();
};
