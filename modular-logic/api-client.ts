import { toast } from "sonner";

type ApiCallOptions<T> = {
  request: () => Promise<Response>;
  onSuccess?: (data: Response) => void;
  onRedirect?: (url: string) => void;
  onError?: (err: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
};

export async function handleApiRequest<T>({
  request,
  onSuccess,
  onError,
  onRedirect,
  successMessage = "Success",
  errorMessage = "Something went wrong",
}: ApiCallOptions<T>) {
  try {
    const data = await request();
    if (!data.ok) {
      throw new Error("Network response was not ok");
    }

    toast.success(successMessage, {
      style: {
        backgroundColor: "green",
        color: "white",
      },
    });
    if (data.redirected) {
      onRedirect?.(data.url);
    }

    onSuccess?.(data);
    return data;
  } catch (err: unknown) {
    console.log(err);
    let message = errorMessage;

    if (err instanceof Error && err.message) {
      message = err.message;
    }

    toast.error(message, {
      style: {
        backgroundColor: "red",
        color: "white",
      },
    });

    onError?.(err);
    return null;
  }
}
