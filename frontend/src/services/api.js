import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    // In local development, default to local backend port 5001
    return `http://${window.location.hostname}:5001`;
  }
  
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;

  // If the browser is accessing this app via port 5001, use relative paths
  if (port === '5001') {
    return '';
  }

  // Otherwise, construct absolute URL for the backend on port 5001
  return `${protocol}//${hostname}:5001`;
};

const API_BASE_URL = getBaseURL();

const API = axios.create({
  baseURL: API_BASE_URL,
});

export { getBaseURL, API_BASE_URL };
export default API;
