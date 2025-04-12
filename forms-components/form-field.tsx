import { useFormContext } from "react-hook-form";
import { ReactNode } from "react";

interface FormFieldProps {
  name: string;
  label?: string;
  children: ReactNode;
}

export const FormField = ({ name, label, children }: FormFieldProps) => {
  const {
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium">{label}</label>}
      {children}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
};
