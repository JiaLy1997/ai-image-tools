"use client";

import { useState, useCallback } from "react";
import { Download, Lock, Unlock, Maximize2 } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";
import { formatSize } from "@/lib/format";

const PRESETS = [
  { label: "1920×1080", w: 1920, h: 1080 },
  { label: "1080×1080", w: 1080, h: 1080 },
  { label: "1280×720", w: 1280, h: 720 },
  { label: "800×600", w: 800, h: 600 },
  { label: "640×480", w: 640, h: 480 },
];

export default function ResizePage() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [lockAspect, setLockAspect] = useState(true);
  const [aspect, setAspect] = useState(1);
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    originalSize: number;
    resizedSize: number;
    w: number;
    h: number;
  } | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      setOriginalDims({ w: img.width, h: img.height });
      setWidth(String(img.width));
      setHeight(String(img.height));
      setAspect(img.width / img.height);
    };
    img.src = url;
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setWidth("");
    setHeight("");
    setResult(null);
  }, []);

  const handleWidthChange = (val: string) => {
    setWidth(val);
    if (lockAspect && val && !isNaN(Number(val))) {
      setHeight(String(Math.round(Number(val) / aspect)));
    }
  };

  const handleHeightChange = (val: string) => {
    setHeight(val);
    if (lockAspect && val && !isNaN(Number(val))) {
      setWidth(String(Math.round(Number(val) * aspect)));
    }
  };

  const applyPreset = (w: number, h: number) => {
    if (lockAspect) {
      setWidth(String(w));
      setHeight(String(Math.round(w / aspect)));
    } else {
      setWidth(String(w));
      setHeight(String(h));
    }
  };

  const applyOriginal = () => {
    setWidth(String(originalDims.w));
    setHeight(String(originalDims.h));
  };

  const handleResize = async () => {
    if (!file || !width || !height) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("width", width);
      formData.append("height", height);

      const res = await fetch("/api/resize", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "调整失败");
        return;
      }

      const originalSize = parseInt(res.headers.get("X-Original-Size") || "0");
      const resizedSize = parseInt(res.headers.get("X-Resized-Size") || "0");
      const w = parseInt(res.headers.get("X-Width") || width);
      const h = parseInt(res.headers.get("X-Height") || height);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      setResult({ url, originalSize, resizedSize, w, h });
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
    a.download = "resized.jpg";
    a.click();
  };

  return (
    <div className="tool-page bg-background">
      <PageHeader title="调整尺寸" />

      <FileUpload
        selectedFile={file}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
      />

      {file && !result && (
        <>
          {/* Dimension inputs */}
          <div className="mt-5 bg-card rounded-2xl p-4">
            <p className="text-sm font-medium mb-3">目标尺寸</p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-text-secondary">宽度</label>
                <div className="flex items-center bg-background rounded-xl px-3 mt-1">
                  <input
                    type="number"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    className="w-full py-2.5 bg-transparent text-sm outline-none"
                    min={1}
                    max={16384}
                  />
                  <span className="text-xs text-text-secondary shrink-0">px</span>
                </div>
              </div>

              <button
                onClick={() => setLockAspect(!lockAspect)}
                className="mt-5 p-2 rounded-full bg-background"
                title={lockAspect ? "锁定比例" : "自由调整"}
              >
                {lockAspect ? (
                  <Lock size={16} className="text-primary" />
                ) : (
                  <Unlock size={16} className="text-text-secondary" />
                )}
              </button>

              <div className="flex-1">
                <label className="text-xs text-text-secondary">高度</label>
                <div className="flex items-center bg-background rounded-xl px-3 mt-1">
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    className="w-full py-2.5 bg-transparent text-sm outline-none"
                    min={1}
                    max={16384}
                  />
                  <span className="text-xs text-text-secondary shrink-0">px</span>
                </div>
              </div>
            </div>

            {originalDims.w > 0 && (
              <p className="text-xs text-text-secondary mt-2">
                原始尺寸: {originalDims.w} × {originalDims.h}
              </p>
            )}
          </div>

          {/* Presets */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">常用尺寸</p>
            <div className="flex flex-wrap gap-2">
              <button
                className="format-chip text-xs"
                onClick={applyOriginal}
              >
                原始
              </button>
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  className="format-chip text-xs"
                  onClick={() => applyPreset(p.w, p.h)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button
            className="btn-primary mt-5 flex items-center justify-center gap-2"
            onClick={handleResize}
            disabled={loading || !width || !height}
          >
            <Maximize2 size={18} />
            {loading ? "处理中..." : "开始调整"}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">调整完成</p>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">原始大小</p>
              <p className="text-base font-bold mt-1">
                {formatSize(result.originalSize)}
              </p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center">
              <p className="text-xs text-text-secondary">调整后</p>
              <p className="text-base font-bold text-primary mt-1">
                {formatSize(result.resizedSize)}
              </p>
            </div>
          </div>

          <div className="bg-background rounded-xl p-3 text-center mb-4">
            <p className="text-xs text-text-secondary">新尺寸</p>
            <p className="text-lg font-bold text-primary">
              {result.w} × {result.h}
            </p>
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
            onClick={handleClear}
          >
            调整另一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
