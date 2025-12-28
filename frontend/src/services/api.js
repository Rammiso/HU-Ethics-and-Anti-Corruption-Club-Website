import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "/api/v1";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor with enhanced error handling
api.interceptors.response.use(
  (response) => {
    // Return the response data directly for successful requests
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const networkError = new Error(
        "Network error. Please check your connection."
      );
      networkError.code = "NETWORK_ERROR";
      return Promise.reject(networkError);
    }

    // Handle token refresh for 401 errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });
          const { accessToken } = response.data;

          localStorage.setItem("accessToken", accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
      }

      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      // Dispatch custom event for auth context to handle
      window.dispatchEvent(new CustomEvent("auth:session-expired"));

      const authError = new Error("Session expired. Please log in again.");
      authError.code = "SESSION_EXPIRED";
      authError.status = 401;
      return Promise.reject(authError);
    }

    // Handle other HTTP errors
    const apiError = new Error(
      error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred"
    );

    apiError.status = error.response?.status;
    apiError.code = error.response?.data?.code || "API_ERROR";
    apiError.response = error.response;

    return Promise.reject(apiError);
  }
);

// API helper functions with enhanced error handling
export const apiClient = {
  // Generic methods
  get: (url, config = {}) => api.get(url, config),
  post: (url, data = {}, config = {}) => api.post(url, data, config),
  put: (url, data = {}, config = {}) => api.put(url, data, config),
  patch: (url, data = {}, config = {}) => api.patch(url, data, config),
  delete: (url, config = {}) => api.delete(url, config),

  // File upload helper
  upload: (url, formData, onUploadProgress) => {
    return api.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress,
    });
  },

  // Download helper
  download: async (url, filename) => {
    try {
      const response = await api.get(url, {
        responseType: "blob",
      });

      const blob = new Blob([response], { type: response.type });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      return { success: true };
    } catch (error) {
      console.error("Download failed:", error);
      throw error;
    }
  },

  // Batch requests helper
  batch: async (requests) => {
    try {
      const responses = await Promise.allSettled(
        requests.map((request) => api(request))
      );

      return responses.map((response, index) => ({
        success: response.status === "fulfilled",
        data: response.status === "fulfilled" ? response.value : null,
        error: response.status === "rejected" ? response.reason : null,
        request: requests[index],
      }));
    } catch (error) {
      console.error("Batch request failed:", error);
      throw error;
    }
  },

  // Health check
  healthCheck: () => api.get("/health"),

  // Request with retry logic
  withRetry: async (requestFn, maxRetries = 3, delay = 1000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) except 408, 429
        if (
          error.status >= 400 &&
          error.status < 500 &&
          error.status !== 408 &&
          error.status !== 429
        ) {
          throw error;
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError;
  },
};

export default api;
