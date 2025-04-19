"use client";

import { useController, useFormContext } from "react-hook-form";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRef, useState } from "react";

interface ImageUploadFieldProps {
  name: string;
  defaultImage?: string;
}

export function FormImageUploadField({
  name,
  defaultImage,
}: ImageUploadFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const {
    field: { onChange, value },
  } = useController({ name, control });

  const [preview, setPreview] = useState<string | null>(
    defaultImage ||
      (value instanceof File ? URL.createObjectURL(value) : value) ||
      null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Send the raw File object to react-hook-form
    onChange(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // reset input manually
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">Image</label>

      <div
        className={cn(
          "w-full h-40 border rounded flex items-center justify-center bg-muted relative overflow-hidden",
          { "cursor-pointer": !preview }
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="absolute top-2 right-2"
              onClick={handleClear}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <ImageIcon className="w-6 h-6 text-muted-foreground" />
        )}
      </div>

      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {errors[name]?.message && (
        <span className="text-sm text-red-500">
          {errors[name]?.message as string}
        </span>
      )}
    </div>
  );
}
