import { toast } from "sonner";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiCallOptions<T> {
  url: string;
  method?: RequestMethod;
  data?: string | FormData;
  config?: AxiosRequestConfig;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (response: AxiosResponse<T>) => void;
  onError?: (err: AxiosError | unknown) => void;
  onRedirect?: (url: string) => void;
}

export async function handleApiRequest<T>({
  url,
  method = "GET",
  data,
  config,
  successMessage = "Success",
  errorMessage = "Something went wrong",
  onSuccess,
  onError,
  onRedirect,
}: ApiCallOptions<T>) {
  try {
    const response = await api.request<T>({
      url,
      method,
      data,
      ...config,
    });

    if ((response.data as { redirectTo?: string }).redirectTo) {
      onRedirect?.(
        (response.data as { redirectTo?: string }).redirectTo as string
      );
      return response.data;
    }
    toast.success(successMessage);
    onSuccess?.(response);
    return response.data;
  } catch (err: any) {
    console.error(err);
    const message = (err.response?.data?.message as string) || errorMessage;

    toast.error(message);
    onError?.(err);
    return null;
  }
}
