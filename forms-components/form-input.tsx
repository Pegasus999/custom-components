import { useFormContext } from "react-hook-form";
import { FormField } from "./form-field";
import { Input } from "../ui/input";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
}

export const FormInput = ({ name, label, ...rest }: FormInputProps) => {
  const { register } = useFormContext();

  return (
    <FormField name={name} label={label}>
      <Input
        {...register(name)}
        {...rest}
        className="border rounded px-3 py-2 w-full"
      />
    </FormField>
  );
};
