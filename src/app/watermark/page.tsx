"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import BottomNav from "@/components/BottomNav";

const POSITIONS = [
  { value: "center", label: "居中" },
  { value: "tile", label: "铺满" },
  { value: "top-left", label: "左上" },
  { value: "top-right", label: "右上" },
  { value: "bottom-left", label: "左下" },
  { value: "bottom-right", label: "右下" },
];

export default function WatermarkPage() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("仅供XX使用");
  const [opacity, setOpacity] = useState(0.4);
  const [fontSize, setFontSize] = useState(36);
  const [position, setPosition] = useState("center");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleWatermark = async () => {
    if (!file || !text.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("text", text);
      formData.append("opacity", String(opacity));
      formData.append("fontSize", String(fontSize));
      formData.append("position", position);

      const res = await fetch("/api/watermark", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "添加水印失败");
        return;
      }

      const blob = await res.blob();
      setResult(URL.createObjectURL(blob));
    } catch {
      alert("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "watermarked.jpg";
    a.click();
  };

  return (
    <div className="tool-page bg-background">
      <div className="flex items-center gap-2 mb-5">
        <Link href="/" className="p-1">
          <ChevronLeft size={24} />
        </Link>
        <h1 className="text-lg font-bold">添加水印</h1>
      </div>

      <FileUpload
        selectedFile={file}
        onFileSelect={setFile}
        onClear={() => {
          setFile(null);
          setResult(null);
        }}
      />

      {/* Settings */}
      {file && !result && (
        <div className="mt-5 space-y-4">
          {/* Watermark text */}
          <div className="bg-card rounded-2xl p-4">
            <label className="text-sm font-medium block mb-2">水印文字</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="请输入水印文字"
              className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Position */}
          <div className="bg-card rounded-2xl p-4">
            <label className="text-sm font-medium block mb-3">水印位置</label>
            <div className="grid grid-cols-3 gap-2">
              {POSITIONS.map((p) => (
                <button
                  key={p.value}
                  className={`format-chip text-xs ${position === p.value ? "active" : ""}`}
                  onClick={() => setPosition(p.value)}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Opacity */}
          <div className="bg-card rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">透明度</span>
              <span className="text-sm text-primary font-semibold">
                {Math.round(opacity * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          {/* Font size */}
          <div className="bg-card rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">字体大小</span>
              <span className="text-sm text-primary font-semibold">
                {fontSize}px
              </span>
            </div>
            <input
              type="range"
              min="12"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      )}

      {/* Generate button */}
      {file && !result && (
        <button
          className="btn-primary mt-5"
          onClick={handleWatermark}
          disabled={loading || !text.trim()}
        >
          {loading ? "处理中..." : "添加水印"}
        </button>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">水印添加完成</p>
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
            }}
          >
            再来一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
