import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const {
      data: { refreshToken },
    } = await api.get("/auth/getRefreshToken");

    // auth token expired in same session
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const {
          data: { success, accessToken },
        } = await api.post("/refresh", {
          data: { refreshToken },
        });

        if (success) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        } else {
          throw new Error("Refresh token failed");
        }
      } catch (refreshError) {
        console.log("refreshError", refreshError);
        // TODO: clear cookies server side
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);
