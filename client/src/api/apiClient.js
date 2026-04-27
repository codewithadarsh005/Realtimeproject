import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api", // ✅ port 5000
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      console.error("API Error:", error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      return Promise.reject({ message: "Server not responding" });
    } else {
      return Promise.reject({ message: error.message });
    }
  }
);

export default apiClient;