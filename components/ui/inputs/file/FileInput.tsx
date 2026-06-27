import { useTranslations } from "next-intl";
import React, { useCallback, useEffect, useState } from "react";
import { Accept, useDropzone } from "react-dropzone";
import { useFormField } from "../../form";
import { XIcon } from "lucide-react";
import { Button } from "../../button";
import { Separator } from "../../separator";

export interface FileInputProps {
  value?: File[] | null;
  onFiles?: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
  onChange?: (files: File[]) => void;
  buttonLabel: React.ReactNode;
  buttonClassName?: string;
}

export const FileInput: React.FC<FileInputProps> = ({
  value = null,
  onFiles: rawOnFiles,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  className,
  onChange,
  buttonLabel,
  buttonClassName,
}) => {
  const t = useTranslations("fileInput");
  const [files, setFiles] = useState<File[]>(value ?? []);
  const { error } = useFormField();

  const onFiles = useCallback(
    (files: File[]) => {
      rawOnFiles?.(files);
      onChange?.(files);
    },
    [rawOnFiles, onChange]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFiles(value ?? []);
  }, [value]);

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const merged = multiple ? [...files, ...acceptedFiles] : acceptedFiles;
      const next =
        typeof maxFiles === "number" ? merged.slice(0, maxFiles) : merged;
      setFiles(next);
      onFiles?.(next);
    },
    [files, multiple, maxFiles, onFiles]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop: handleDrop,
    accept: accept,
    multiple,
    maxSize,
    maxFiles,
    disabled,
  });

  const removeAt = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onFiles?.(next);
  };

  return (
    <div className={className}>
      <div
        {...getRootProps()}
        aria-invalid={!!error}
        className={`border border-dashed border-purple-500/50 px-4 py-12 rounded-md text-center aria-invalid:ring-destructive/20 aria-invalid:border-destructive bg-white/4 backdrop-blur-sm transition-colors ${
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-white/8 hover:border-purple-400/70"
        } ${isDragActive ? "bg-purple-500/10 border-purple-400" : ""}`}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center justify-center mb-4">
          <span className="text-3xl mb-3">
            <span className="material-symbols-outlined material-symbols-outlined-sized text-purple-400">
              upload
            </span>
          </span>
          <span className="font-semibold mb-2 text-foreground">
            {isDragActive
              ? t("dropzoneIsDragActivePrompt")
              : t("dropzonePrompt")}
          </span>
          <button
            type="button"
            onClick={open}
            disabled={disabled}
            className="text-muted-foreground text-xs hover:text-foreground transition-colors"
          >
            {t("selectFilesButton")}
          </button>
        </div>
        <Button
          variant="tertiary"
          type="button"
          className={`cursor-pointer ${buttonClassName ?? ""}`}
        >
          {buttonLabel}
        </Button>
      </div>

      {files.length > 0 && (
        <>
          <div className="pb-2 pt-3">
            <Separator />
          </div>
          <ul className="flex flex-col gap-2">
            {files.map((file, idx) => (
              <li
                key={`${file.name}-${file.size}-${idx}`}
                className="flex gap-2 p-3 bg-white/5 border border-white/10 rounded-md items-center"
              >
                <div className="p-2 rounded-sm">
                  <span className="material-symbols-outlined text-green-400">
                    file_present
                  </span>
                </div>
                <div className="flex-1 flex flex-col leading-none gap-1">
                  <span className="text-xs font-semibold text-foreground">{file.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => removeAt(idx)}
                  aria-label={t("removeAriaLabel", { fileName: file.name })}
                  size="icon"
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <XIcon />
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default FileInput;
