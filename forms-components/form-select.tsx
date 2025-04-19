"use client";

import { useController, useFormContext } from "react-hook-form";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import Spinner from "../spinner";

type Option = {
  label: string;
  value: string;
};

interface SelectFieldProps {
  name: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
}

export function FormSelectField({
  name,
  options,
  placeholder,
  disabled,
  isLoading,
}: SelectFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const {
    field: { value, onChange },
  } = useController({ name, control });

  return isLoading ? (
    <div className="w-full flex items-center justify-center">
      <Spinner />
    </div>
  ) : (
    <div className="flex flex-col gap-1">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder || "Select an option"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors[name]?.message && (
        <span className="text-sm text-red-500">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
}
