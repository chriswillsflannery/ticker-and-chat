import axios, { AxiosInstance } from "axios";
import { useEffect } from "react";

export const api = axios.create({
  baseURL: "/api",
});

interface UseAxiosInterceptorsProps {
  api: AxiosInstance;
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  onRefreshError?: () => void;
}

export function useAxiosInterceptors({
  api,
  accessToken,
  setAccessToken,
  onRefreshError = () => {
    window.location.href = "/login";
  },
}: UseAxiosInterceptorsProps) {
  useEffect(() => {
    const requestInterceptor = api.interceptors.request.use(
      (config) => {
        if (accessToken) {
          console.log('attaching AT: ', accessToken);
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const {
              data: { refreshToken },
            } = await api.get("/auth/getRefreshToken");

            const {
              data: { success, accessToken: newAccessToken },
            } = await api.post("/refresh", {
              data: { refreshToken },
            });

            if (success && newAccessToken) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              setAccessToken(newAccessToken);
              return api(originalRequest);
            } else {
              throw new Error("Refresh token failed");
            }
          } catch (refreshError) {
            console.error("refreshError", refreshError);
            onRefreshError();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken, api, setAccessToken, onRefreshError]);
}
