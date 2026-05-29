"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, ImagePlus, X } from "lucide-react";
import { formatSize } from "@/lib/format";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  selectedFile: File | null;
  onClear: () => void;
}

export default function FileUpload({
  onFileSelect,
  accept = "image/*",
  selectedFile,
  onClear,
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile]
  );

  if (selectedFile) {
    return (
      <div className="upload-zone has-file">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ImagePlus size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
            <p className="text-xs text-text-secondary mt-0.5">
              {formatSize(selectedFile.size)}
            </p>
          </div>
          <button
            onClick={onClear}
            className="w-8 h-8 rounded-full bg-border/50 flex items-center justify-center shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`upload-zone ${dragOver ? "!border-primary !bg-primary/5" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
            <ImagePlus size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">点击选择图片</p>
            <p className="text-xs text-text-secondary mt-1">
              或从相册拖拽到此处
            </p>
          </div>
        </div>
      </div>

      {/* Mobile camera button */}
      <div className="flex gap-3 mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border text-sm font-medium"
        >
          <ImagePlus size={18} />
          从相册选择
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white border border-border text-sm font-medium"
        >
          <Camera size={18} />
          拍照
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </>
  );
}
