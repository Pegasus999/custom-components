import { toast } from "sonner";
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";

// Create axios instance with default configuration
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create external API client for third-party services
export const externalApi = axios.create({
  timeout: 30000, // 30 seconds default
  headers: {
    "Content-Type": "application/json",
  },
});

type RequestMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiCallOptions<T> {
  // Support both axios-style and fetch-style requests
  url?: string;
  method?: RequestMethod;
  data?: string | FormData | Record<string, any>;
  config?: AxiosRequestConfig;
  request?: () => Promise<Response>; // For custom fetch requests

  // Response handling
  parseResponse?: (response: Response | AxiosResponse<T>) => Promise<T>;

  // Callbacks
  onSuccess?: (data: T, response?: AxiosResponse<T> | Response) => void;
  onError?: (err: AxiosError | Error | unknown) => void;
  onRedirect?: (url: string) => void;

  // Messages
  successMessage?: string;
  errorMessage?: string;

  // Options
  showToasts?: boolean;
}

interface ExternalApiCallOptions<T> extends Omit<ApiCallOptions<T>, "config"> {
  baseURL?: string;
  headers?: Record<string, string>;
  auth?: {
    type: "bearer" | "basic" | "api_key" | "oauth2" | "headers";
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
    clientId?: string;
    clientSecret?: string;
    // Custom headers for auth
    authHeaders?: Record<string, string>;
  };
  timeout?: number;
}

export async function handleApiRequest<T>({
  url,
  method = "GET",
  data,
  config,
  request,
  parseResponse,
  onSuccess,
  onError,
  onRedirect,
  successMessage = "Success",
  errorMessage = "Something went wrong",
  showToasts = true,
}: ApiCallOptions<T>) {
  try {
    let response: AxiosResponse<T> | Response;
    let parsedData: T;

    if (request) {
      // Use custom fetch request
      response = await request();

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      parsedData = parseResponse
        ? await parseResponse(response)
        : await response.json();

      // Handle fetch redirects
      if (response.redirected) {
        onRedirect?.(response.url);
      }
    } else {
      // Use axios request
      if (!url) {
        throw new Error(
          "URL is required when not using custom request function"
        );
      }

      response = await api.request<T>({
        url,
        method,
        data,
        ...config,
      });

      parsedData = parseResponse
        ? await parseResponse(response)
        : response.data;

      // Handle axios redirects (check response data for redirect info)
      if ((response.data as any)?.redirectTo) {
        onRedirect?.((response.data as any).redirectTo);
        return parsedData;
      }
    }

    if (showToasts) {
      toast.success(successMessage);
    }

    onSuccess?.(parsedData, response);
    return parsedData;
  } catch (err: unknown) {
    console.error(err);
    let message = errorMessage;

    // Enhanced error message extraction
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      message =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        axiosErr.message ||
        errorMessage;
    } else if (err instanceof Error) {
      message = err.message;
    }

    if (showToasts) {
      toast.error(message);
    }

    onError?.(err);
    return null;
  }
}

export async function handleExternalApiRequest<T>({
  url,
  method = "GET",
  data,
  baseURL,
  headers = {},
  auth,
  timeout = 30000,
  parseResponse,
  onSuccess,
  onError,
  successMessage = "Success",
  errorMessage = "External API call failed",
  showToasts = false, // Don't show toasts for external API calls by default
}: ExternalApiCallOptions<T>) {
  try {
    if (!url) {
      throw new Error("URL is required for external API calls");
    }

    // Configure authentication headers
    const authHeaders: Record<string, string> = {};

    if (auth) {
      switch (auth.type) {
        case "bearer":
          if (auth.token) {
            authHeaders["Authorization"] = `Bearer ${auth.token}`;
          }
          break;
        case "basic":
          if (auth.username && auth.password) {
            const credentials = btoa(`${auth.username}:${auth.password}`);
            authHeaders["Authorization"] = `Basic ${credentials}`;
          }
          break;
        case "api_key":
          if (auth.apiKey) {
            const headerName = auth.apiKeyHeader || "X-API-Key";
            authHeaders[headerName] = auth.apiKey;
          }
          break;
        case "oauth2":
          // For OAuth2, we'll handle the token in the request body or headers
          if (auth.token) {
            authHeaders["Authorization"] = `Bearer ${auth.token}`;
          }
          break;
        case "headers":
          if (auth.authHeaders) {
            Object.assign(authHeaders, auth.authHeaders);
          }
          break;
      }
    }

    // Create axios instance for this request with SSL configuration
    const axiosInstance = axios.create({
      baseURL,
      timeout,
      headers: {
        "Content-Type": "application/json",
        ...headers,
        ...authHeaders,
      },
      // SSL configuration
      httpsAgent: new (require("https").Agent)({
        rejectUnauthorized: false, // Allow self-signed certificates
        secureProtocol: "TLSv1_2_method", // Use TLS 1.2
      }),
    });

    const response = await axiosInstance.request<T>({
      url,
      method,
      data,
    });

    const parsedData = parseResponse
      ? await parseResponse(response)
      : response.data;

    if (showToasts) {
      toast.success(successMessage);
    }

    onSuccess?.(parsedData, response);
    return parsedData;
  } catch (err: unknown) {
    // Enhanced error logging with request and response details
    console.error("=== EXTERNAL API ERROR DETAILS ===");
    console.error("Request URL:", (baseURL || "") + (url || ""));
    console.error("Request Method:", method);
    console.error("Request Headers:", {
      ...headers,
      ...(auth?.authHeaders || {}),
      ...(auth?.type === "bearer" && auth.token
        ? { Authorization: "Bearer [REDACTED]" }
        : {}),
      ...(auth?.type === "basic" && auth.username
        ? { Authorization: "Basic [REDACTED]" }
        : {}),
      ...(auth?.type === "api_key" && auth.apiKey
        ? { [auth.apiKeyHeader || "X-API-Key"]: "[REDACTED]" }
        : {}),
    });
    console.error("Request Data:", data);
    console.error("Auth Type:", auth?.type);

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      console.error("Response Status:", axiosErr.response?.status);
      console.error("Response Status Text:", axiosErr.response?.statusText);
      console.error("Response Headers:", axiosErr.response?.headers);
      console.error("Response Data:", axiosErr.response?.data);
      console.error("Request Config:", {
        url: axiosErr.config?.url,
        method: axiosErr.config?.method,
        baseURL: axiosErr.config?.baseURL,
        timeout: axiosErr.config?.timeout,
      });
      console.error("Error Code:", axiosErr.code);
      console.error("Error Message:", axiosErr.message);
    } else if (err instanceof Error) {
      console.error("Error Type:", err.constructor.name);
      console.error("Error Message:", err.message);
      console.error("Error Stack:", err.stack);
    } else {
      console.error("Unknown Error:", err);
    }
    console.error("=== END ERROR DETAILS ===");

    let message = errorMessage;

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<any>;
      message =
        axiosErr.response?.data?.message ||
        axiosErr.response?.data?.error ||
        axiosErr.response?.data?.detail ||
        axiosErr.message ||
        errorMessage;
    } else if (err instanceof Error) {
      message = err.message;
    }

    if (showToasts) {
      toast.error(message);
    }

    onError?.(err);
    return null;
  }
}

// Convenience methods for common HTTP operations
export const apiClient = {
  get: <T>(url: string, options?: Omit<ApiCallOptions<T>, "url" | "method">) =>
    handleApiRequest<T>({ url, method: "GET", showToasts: false, ...options }),

  post: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ApiCallOptions<T>, "url" | "method" | "data">
  ) => handleApiRequest<T>({ url, method: "POST", data, ...options }),

  put: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ApiCallOptions<T>, "url" | "method" | "data">
  ) => handleApiRequest<T>({ url, method: "PUT", data, ...options }),

  patch: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ApiCallOptions<T>, "url" | "method" | "data">
  ) => handleApiRequest<T>({ url, method: "PATCH", data, ...options }),

  delete: <T>(
    url: string,
    options?: Omit<ApiCallOptions<T>, "url" | "method">
  ) => handleApiRequest<T>({ url, method: "DELETE", ...options }),
};

// Convenience methods for external API operations
export const externalApiClient = {
  get: <T>(
    url: string,
    options?: Omit<ExternalApiCallOptions<T>, "url" | "method">
  ) => handleExternalApiRequest<T>({ url, method: "GET", ...options }),

  post: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ExternalApiCallOptions<T>, "url" | "method" | "data">
  ) => handleExternalApiRequest<T>({ url, method: "POST", data, ...options }),

  put: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ExternalApiCallOptions<T>, "url" | "method" | "data">
  ) => handleExternalApiRequest<T>({ url, method: "PUT", data, ...options }),

  patch: <T>(
    url: string,
    data?: Record<string, unknown>,
    options?: Omit<ExternalApiCallOptions<T>, "url" | "method" | "data">
  ) => handleExternalApiRequest<T>({ url, method: "PATCH", data, ...options }),

  delete: <T>(
    url: string,
    options?: Omit<ExternalApiCallOptions<T>, "url" | "method">
  ) => handleExternalApiRequest<T>({ url, method: "DELETE", ...options }),
};
