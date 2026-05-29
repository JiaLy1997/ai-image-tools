"use client";

import { useRef, useCallback } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { formatSize } from "@/lib/format";

interface MultiFileUploadProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
  onClear: () => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
  accept?: string;
}

export default function MultiFileUpload({
  onFilesSelect,
  selectedFiles,
  onClear,
  onRemove,
  maxFiles = 9,
  accept = "image/*",
}: MultiFileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList) return;
      const newFiles = Array.from(fileList).filter((f) =>
        f.type.startsWith("image/")
      );
      if (newFiles.length === 0) return;
      const combined = [...selectedFiles, ...newFiles].slice(0, maxFiles);
      onFilesSelect(combined);
    },
    [selectedFiles, maxFiles, onFilesSelect]
  );

  if (selectedFiles.length > 0) {
    return (
      <div>
        <div className="grid grid-cols-3 gap-2">
          {selectedFiles.map((file, i) => (
            <div key={i} className="relative group">
              <div className="aspect-square rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
              <p className="text-[10px] text-text-secondary mt-1 truncate text-center">
                {formatSize(file.size)}
              </p>
            </div>
          ))}
          {selectedFiles.length < maxFiles && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border-2 border-dashed border-border flex items-center justify-center text-text-secondary"
            >
              <ImagePlus size={24} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-text-secondary">
            {selectedFiles.length}/{maxFiles} 张图片
          </p>
          <button
            onClick={onClear}
            className="text-xs text-primary font-medium"
          >
            清空
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    );
  }

  return (
    <>
      <div
        className="upload-zone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ImagePlus size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">点击选择图片</p>
            <p className="text-xs text-text-secondary mt-1">
              最多 {maxFiles} 张，或拖拽到此处
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium"
        >
          <ImagePlus size={18} />
          从相册选择
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-medium"
        >
          <Camera size={18} />
          拍照
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </>
  );
}
