"use client";

import {
  FormProvider,
  useForm,
  type FieldValues,
  type SubmitHandler,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodType } from "zod";

interface FormWrapperProps<T extends FieldValues> {
  schema: ZodType<T>;
  onSubmit: SubmitHandler<T>;
  children: React.ReactNode;
}

export function FormWrapper<T extends FieldValues>({
  schema,
  onSubmit,
  children,
}: FormWrapperProps<T>) {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {children}
      </form>
    </FormProvider>
  );
}
