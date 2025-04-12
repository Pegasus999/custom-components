import { toast } from "sonner";

type ApiCallOptions<T> = {
  request: () => Promise<T>;
  onSuccess?: (data: T) => void;
  onError?: (err: unknown) => void;
  successMessage?: string;
  errorMessage?: string;
};

export async function handleApiRequest<T>({
  request,
  onSuccess,
  onError,
  successMessage = "Success",
  errorMessage = "Something went wrong",
}: ApiCallOptions<T>) {
  try {
    const data = await request();
    toast.success(successMessage);
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
