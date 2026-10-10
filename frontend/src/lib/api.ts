import axios from 'axios';
import Swal from 'sweetalert2';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to handle global errors cleanly with SweetAlert2
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the backend sent our custom formatted error JSON
    if (error.response && error.response.data && error.response.data.title) {
      const { title, message, detail } = error.response.data;
      Swal.fire({
        title: title || 'Error',
        text: message || 'Something went wrong.',
        icon: 'error',
        footer: detail ? `<span style="color: #ef4444; font-size: 0.8rem">${detail}</span>` : undefined
      });
    } else {
      // Fallback for network issues (e.g. backend down)
      Swal.fire({
        title: 'Network Error',
        text: 'Unable to connect to the Salary API. Please try again later.',
        icon: 'error',
      });
    }
    return Promise.reject(error);
  }
);

export default api;
