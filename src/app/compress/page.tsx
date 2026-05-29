"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import BottomNav from "@/components/BottomNav";
import { formatSize } from "@/lib/format";

export default function CompressPage() {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(75);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    compressedSize: number;
    filename: string;
  } | null>(null);

  const handleCompress = async () => {
    if (!file) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("quality", String(quality));

      const res = await fetch("/api/compress", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "压缩失败");
        return;
      }

      const originalSize = parseInt(res.headers.get("X-Original-Size") || "0");
      const compressedSize = parseInt(res.headers.get("X-Compressed-Size") || "0");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      const match = cd.match(/filename="(.+)"/);
      const filename = match ? match[1] : "compressed.jpg";

      setResult({ url, originalSize, compressedSize, filename });
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
        <h1 className="text-lg font-bold">图片压缩</h1>
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

      {/* Quality slider */}
      {file && !result && (
        <div className="mt-5 bg-card rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">压缩质量</span>
            <span className="text-sm text-primary font-semibold">
              {quality}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(parseInt(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-secondary mt-1">
            <span>体积小</span>
            <span>更清晰</span>
          </div>
        </div>
      )}

      {/* Compress button */}
      {file && !result && (
        <button
          className="btn-primary mt-5"
          onClick={handleCompress}
          disabled={loading}
        >
          {loading ? "压缩中..." : "开始压缩"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium">压缩结果</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">原始大小</p>
              <p className="text-base font-bold mt-1">
                {formatSize(result.originalSize)}
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">压缩后</p>
              <p className="text-base font-bold text-success mt-1">
                {formatSize(result.compressedSize)}
              </p>
            </div>
          </div>

          <div className="bg-background rounded-xl p-3 text-center mb-4">
            <p className="text-xs text-text-secondary">节省</p>
            <p className="text-lg font-bold text-primary">
              {(
                (1 - result.compressedSize / result.originalSize) *
                100
              ).toFixed(1)}
              %
            </p>
          </div>

          <button className="btn-primary flex items-center justify-center gap-2" onClick={handleDownload}>
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
            压缩另一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
