"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import BottomNav from "@/components/BottomNav";
import { formatSize } from "@/lib/format";

const FORMATS = [
  { value: "jpg", label: "JPG" },
  { value: "png", label: "PNG" },
  { value: "webp", label: "WebP" },
  { value: "avif", label: "AVIF" },
];

export default function ConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState("webp");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    convertedSize: number;
    filename: string;
  } | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", format);

      const res = await fetch("/api/convert", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "转换失败");
        return;
      }

      const originalSize = parseInt(res.headers.get("X-Original-Size") || "0");
      const convertedSize = parseInt(res.headers.get("X-Converted-Size") || "0");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setResult({
        url,
        originalSize,
        convertedSize,
        filename: `converted.${format}`,
      });
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = result.filename;
    a.click();
  };

  return (
    <div className="tool-page bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">格式转换</h1>
      </div>

      {/* Upload */}
      <FileUpload
        selectedFile={file}
        onFileSelect={setFile}
        onClear={() => {
          setFile(null);
          setResult(null);
        }}
      />

      {/* Format selection */}
      {file && !result && (
        <div className="mt-5">
          <p className="text-sm font-medium mb-3">转换为</p>
          <div className="format-grid">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                className={`format-chip ${format === f.value ? "active" : ""}`}
                onClick={() => setFormat(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Convert button */}
      {file && !result && (
        <button
          className="btn-primary mt-5"
          onClick={handleConvert}
          disabled={loading}
        >
          {loading ? "转换中..." : "开始转换"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">转换完成</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">原始大小</p>
              <p className="text-base font-bold mt-1">
                {formatSize(result.originalSize)}
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">转换后</p>
              <p className="text-base font-bold text-primary mt-1">
                {formatSize(result.convertedSize)}
              </p>
            </div>
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
            }}
          >
            转换另一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
