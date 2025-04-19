import { useFormContext, Controller } from "react-hook-form";
import { FormField } from "./form-field";
import { Switch } from "../ui/switch";

interface FormSwitchProps {
  name: string;
  label?: string;
  defaultValue?: boolean;
}

export const FormSwitch = ({
  name,
  label,
  defaultValue = false,
}: FormSwitchProps) => {
  const { control } = useFormContext();

  return (
    <FormField name={name} label={label}>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={({ field: { value, onChange } }) => (
          <Switch checked={value} onCheckedChange={onChange} />
        )}
      />
    </FormField>
  );
};
