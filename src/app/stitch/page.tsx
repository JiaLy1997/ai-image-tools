"use client";

import { useState, useCallback } from "react";
import { Download, LayoutGrid } from "lucide-react";
import MultiFileUpload from "@/components/MultiFileUpload";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

export default function StitchPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [cols, setCols] = useState(2);
  const [gap, setGap] = useState(0);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFilesSelect = useCallback((f: File[]) => {
    setFiles(f);
    setResult(null);
  }, []);

  const handleRemove = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClear = useCallback(() => {
    setFiles([]);
    setResult(null);
  }, []);

  const handleStitch = async () => {
    if (files.length < 2) return;
    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("cols", String(cols));
      formData.append("gap", String(gap));
      formData.append("bgColor", bgColor);
      files.forEach((f) => formData.append("files", f));

      const res = await fetch("/api/stitch", { method: "POST", body: formData });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "拼接失败");
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
    a.download = "stitched.jpg";
    a.click();
  };

  return (
    <div className="tool-page bg-background">
      <PageHeader title="图片拼接" />

      <MultiFileUpload
        selectedFiles={files}
        onFilesSelect={handleFilesSelect}
        onClear={handleClear}
        onRemove={handleRemove}
        maxFiles={9}
      />

      {files.length >= 2 && !result && (
        <>
          {/* Columns */}
          <div className="mt-5 bg-card rounded-2xl p-4">
            <p className="text-sm font-medium mb-3">列数</p>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                    cols === n
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border"
                  }`}
                  onClick={() => setCols(n)}
                >
                  {n} 列
                </button>
              ))}
            </div>
          </div>

          {/* Gap & Color */}
          <div className="mt-3 bg-card rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">间距</span>
              <span className="text-sm text-primary font-semibold">{gap}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={gap}
              onChange={(e) => setGap(parseInt(e.target.value))}
              className="w-full accent-primary"
            />

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-medium">背景色</span>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded-lg border border-border cursor-pointer"
              />
            </div>
          </div>

          {/* Preview grid */}
          <div className="mt-3 bg-card rounded-2xl p-4">
            <p className="text-sm font-medium mb-2">预览</p>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
              {files.map((file, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-background"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={URL.createObjectURL(file)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            className="btn-primary mt-5 flex items-center justify-center gap-2"
            onClick={handleStitch}
            disabled={loading}
          >
            <LayoutGrid size={18} />
            {loading ? "拼接中..." : "开始拼接"}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">拼接完成</p>
          <div className="rounded-xl overflow-hidden bg-background mb-4">
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
            onClick={handleClear}
          >
            拼接其他图片
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
