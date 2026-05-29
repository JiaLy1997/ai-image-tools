"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import BottomNav from "@/components/BottomNav";

const PRESETS = [
  { label: "1:1", ratio: 1, desc: "头像" },
  { label: "4:3", ratio: 4 / 3, desc: "标准" },
  { label: "16:9", ratio: 16 / 9, desc: "横屏" },
  { label: "9:16", ratio: 9 / 16, desc: "竖屏" },
  { label: "3:4", ratio: 3 / 4, desc: "照片" },
  { label: "自定义", ratio: 0, desc: "自由裁剪" },
];

export default function CropPage() {
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ratio, setRatio] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setResult(null);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleCrop = useCallback(async () => {
    if (!imageUrl || !canvasRef.current) return;
    setLoading(true);

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      let sx = 0,
        sy = 0,
        sw = img.width,
        sh = img.height;

      if (ratio > 0) {
        const imgRatio = img.width / img.height;
        if (imgRatio > ratio) {
          sw = Math.round(img.height * ratio);
          sx = Math.round((img.width - sw) / 2);
        } else {
          sh = Math.round(img.width / ratio);
          sy = Math.round((img.height - sh) / 2);
        }
      }

      canvas.width = sw;
      canvas.height = sh;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            setResult(URL.createObjectURL(blob));
          }
          setLoading(false);
        },
        "image/jpeg",
        0.92
      );
    };
    img.src = imageUrl;
  }, [imageUrl, ratio]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "cropped.jpg";
    a.click();
  };

  return (
    <div className="tool-page bg-background">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">图片裁剪</h1>
      </div>

      <FileUpload
        selectedFile={file}
        onFileSelect={setFile}
        onClear={() => {
          setFile(null);
          setImageUrl(null);
          setResult(null);
        }}
      />

      {/* Preview */}
      {imageUrl && !result && (
        <div className="mt-4 bg-card rounded-2xl p-3">
          <div
            className="relative w-full overflow-hidden rounded-xl bg-black/5"
            style={{
              aspectRatio: ratio > 0 ? String(ratio) : "auto",
              maxHeight: "300px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imageUrl}
              alt="preview"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Ratio selection */}
      {imageUrl && !result && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-3">裁剪比例</p>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className={`format-chip ${ratio === p.ratio ? "active" : ""}`}
                onClick={() => setRatio(p.ratio)}
              >
                <span className="block text-sm">{p.label}</span>
                <span className="block text-[10px] text-text-secondary mt-0.5">
                  {p.desc}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Crop button */}
      {imageUrl && !result && (
        <button
          className="btn-primary mt-5"
          onClick={handleCrop}
          disabled={loading}
        >
          {loading ? "裁剪中..." : "开始裁剪"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">裁剪完成</p>
          <div className="rounded-xl overflow-hidden bg-black/5 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result} alt="result" className="w-full object-contain" />
          </div>
          <button
            className="btn-primary flex items-center justify-center gap-2"
            onClick={handleDownload}
          >
            <Download size={18} />
            保存到手机
          </button>
          <button
            className="w-full mt-3 py-3 text-sm text-text-secondary font-medium"
            onClick={() => {
              setResult(null);
              setFile(null);
              setImageUrl(null);
            }}
          >
            裁剪另一张
          </button>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
      <BottomNav />
    </div>
  );
}
