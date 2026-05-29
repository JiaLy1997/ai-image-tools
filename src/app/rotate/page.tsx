"use client";

import { useRef, useState, useCallback } from "react";
import { Download, RotateCw, FlipHorizontal, FlipVertical } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

const PRESETS = [
  { label: "90°", angle: 90 },
  { label: "180°", angle: 180 },
  { label: "270°", angle: 270 },
];

export default function RotatePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setImageUrl(null);
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
    setResult(null);
  }, []);

  const handleRotate = useCallback(async () => {
    if (!imageUrl) return;
    setLoading(true);

    const img = new Image();
    img.src = imageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const rad = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(rad));
    const sin = Math.abs(Math.sin(rad));
    const newW = Math.round(img.width * cos + img.height * sin);
    const newH = Math.round(img.width * sin + img.height * cos);

    canvas.width = newW;
    canvas.height = newH;

    ctx.translate(newW / 2, newH / 2);
    ctx.rotate(rad);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

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
  }, [imageUrl, angle, flipH, flipV]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "rotated.jpg";
    a.click();
  };

  const transform = `rotate(${angle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`;

  return (
    <div className="tool-page bg-background">
      <PageHeader title="图片旋转" />
      <canvas ref={canvasRef} className="hidden" />

      <FileUpload
        selectedFile={file}
        onFileSelect={handleFileSelect}
        onClear={handleClear}
      />

      {file && !result && imageUrl && (
        <>
          {/* Preview */}
          <div className="mt-5 bg-card rounded-2xl p-4">
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-background" style={{ minHeight: 200 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="preview"
                className="max-w-full max-h-[50vh] object-contain transition-transform duration-200"
                style={{ transform }}
              />
            </div>
          </div>

          {/* Angle slider */}
          <div className="mt-4 bg-card rounded-2xl p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium">旋转角度</span>
              <span className="text-sm text-primary font-semibold">{angle}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-text-secondary mt-1">
              <span>-180°</span>
              <span>180°</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="mt-4 flex gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.angle}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                  angle === p.angle
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card"
                }`}
                onClick={() => setAngle(p.angle)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Flip buttons */}
          <div className="mt-3 flex gap-2">
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                flipH
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              }`}
              onClick={() => setFlipH(!flipH)}
            >
              <FlipHorizontal size={18} />
              水平翻转
            </button>
            <button
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                flipV
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card"
              }`}
              onClick={() => setFlipV(!flipV)}
            >
              <FlipVertical size={18} />
              垂直翻转
            </button>
          </div>

          {/* Action button */}
          <button
            className="btn-primary mt-5 flex items-center justify-center gap-2"
            onClick={handleRotate}
            disabled={loading}
          >
            <RotateCw size={18} />
            {loading ? "处理中..." : "开始旋转"}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">旋转完成</p>
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
            旋转另一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
