"use client";

import { useRef, useState, useCallback } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

interface FilterValues {
  brightness: number;
  contrast: number;
  saturation: number;
  blur: number;
  sepia: number;
  grayscale: number;
  temperature: number;
  sharpen: number;
  vignette: number;
}

const DEFAULTS: FilterValues = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  blur: 0,
  sepia: 0,
  grayscale: 0,
  temperature: 0,
  sharpen: 0,
  vignette: 0,
};

const PRESETS = [
  { name: "原片", values: DEFAULTS },
  { name: "黑白", values: { ...DEFAULTS, grayscale: 100 } },
  { name: "复古", values: { ...DEFAULTS, sepia: 40, contrast: 110, saturation: 80 } },
  { name: "暖色", values: { ...DEFAULTS, temperature: 50, saturation: 110 } },
  { name: "冷色", values: { ...DEFAULTS, temperature: -50, saturation: 90 } },
  { name: "高对比", values: { ...DEFAULTS, contrast: 140, saturation: 120, sharpen: 50 } },
  { name: "柔和", values: { ...DEFAULTS, brightness: 110, contrast: 90, saturation: 80, blur: 1 } },
];

const SLIDERS: { key: keyof FilterValues; label: string; min: number; max: number; step: number }[] = [
  { key: "brightness", label: "亮度", min: 0, max: 200, step: 1 },
  { key: "contrast", label: "对比度", min: 0, max: 200, step: 1 },
  { key: "saturation", label: "饱和度", min: 0, max: 200, step: 1 },
  { key: "grayscale", label: "灰度", min: 0, max: 100, step: 1 },
  { key: "sepia", label: "复古", min: 0, max: 100, step: 1 },
  { key: "blur", label: "模糊", min: 0, max: 20, step: 0.5 },
  { key: "temperature", label: "色温", min: -100, max: 100, step: 1 },
  { key: "sharpen", label: "锐化", min: 0, max: 100, step: 1 },
  { key: "vignette", label: "暗角", min: 0, max: 100, step: 1 },
];

function buildCSSFilter(v: FilterValues): string {
  return [
    `brightness(${v.brightness / 100})`,
    `contrast(${v.contrast / 100})`,
    `saturate(${v.saturation / 100})`,
    `grayscale(${v.grayscale}%)`,
    `sepia(${v.sepia}%)`,
    `blur(${v.blur}px)`,
  ].join(" ");
}

export default function FilterPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState("原片");
  const [values, setValues] = useState<FilterValues>(DEFAULTS);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setValues(DEFAULTS);
    setActivePreset("原片");
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setImageUrl(null);
    setValues(DEFAULTS);
    setActivePreset("原片");
    setResult(null);
  }, []);

  const applyPreset = (preset: typeof PRESETS[number]) => {
    setValues(preset.values);
    setActivePreset(preset.name);
  };

  const updateValue = (key: keyof FilterValues, val: number) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setActivePreset("自定义");
  };

  const handleApply = useCallback(async () => {
    if (!imageUrl) return;
    setLoading(true);

    const img = new Image();
    img.src = imageUrl;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    canvas.width = img.width;
    canvas.height = img.height;

    // Apply CSS-compatible filters
    ctx.filter = buildCSSFilter(values);
    ctx.drawImage(img, 0, 0);

    // Reset filter for pixel manipulation
    ctx.filter = "none";

    // Apply temperature via pixel data
    if (values.temperature !== 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const temp = values.temperature;
      for (let i = 0; i < data.length; i += 4) {
        if (temp > 0) {
          data[i] = Math.min(255, data[i] + temp * 0.5);       // R up
          data[i + 2] = Math.max(0, data[i + 2] - temp * 0.3); // B down
        } else {
          data[i] = Math.max(0, data[i] + temp * 0.3);          // R down
          data[i + 2] = Math.min(255, data[i + 2] - temp * 0.5); // B up
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply sharpen via convolution
    if (values.sharpen > 0) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const w = canvas.width;
      const h = canvas.height;
      const strength = values.sharpen / 100;
      const copy = new Uint8ClampedArray(data);

      for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {
          const idx = (y * w + x) * 4;
          for (let c = 0; c < 3; c++) {
            const center = copy[idx + c] * 5;
            const around =
              copy[((y - 1) * w + x) * 4 + c] +
              copy[((y + 1) * w + x) * 4 + c] +
              copy[(y * w + x - 1) * 4 + c] +
              copy[(y * w + x + 1) * 4 + c];
            const sharpened = center - around;
            data[idx + c] = Math.min(
              255,
              Math.max(0, copy[idx + c] + (sharpened - copy[idx + c]) * strength)
            );
          }
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }

    // Apply vignette
    if (values.vignette > 0) {
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const radius = Math.max(cx, cy);
      const gradient = ctx.createRadialGradient(
        cx, cy, radius * 0.3,
        cx, cy, radius
      );
      gradient.addColorStop(0, "rgba(0,0,0,0)");
      gradient.addColorStop(1, `rgba(0,0,0,${values.vignette / 100 * 0.8})`);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

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
  }, [imageUrl, values]);

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "filtered.jpg";
    a.click();
  };

  const cssFilter = buildCSSFilter(values);

  return (
    <div className="tool-page bg-background">
      <PageHeader title="滤镜" />
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
            <div className="flex items-center justify-center overflow-hidden rounded-xl bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="preview"
                className="max-w-full max-h-[40vh] object-contain transition-[filter] duration-200"
                style={{ filter: cssFilter }}
              />
            </div>
          </div>

          {/* Presets */}
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">预设滤镜</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    activePreset === p.name
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card"
                  }`}
                  onClick={() => applyPreset(p)}
                >
                  {p.name}
                </button>
              ))}
              {activePreset === "自定义" && (
                <span className="shrink-0 px-4 py-2 rounded-full text-sm font-medium border border-primary bg-primary/10 text-primary">
                  自定义
                </span>
              )}
            </div>
          </div>

          {/* Advanced toggle */}
          <button
            className="w-full mt-4 py-2.5 rounded-xl bg-card text-sm font-medium flex items-center justify-center gap-2"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <SlidersHorizontal size={16} />
            {showAdvanced ? "收起调节" : "高级调节"}
          </button>

          {/* Sliders */}
          {showAdvanced && (
            <div className="mt-3 bg-card rounded-2xl p-4 space-y-4">
              {SLIDERS.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{s.label}</span>
                    <span className="text-sm text-primary font-semibold">
                      {values[s.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={values[s.key]}
                    onChange={(e) =>
                      updateValue(s.key, parseFloat(e.target.value))
                    }
                    className="w-full accent-primary"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Apply button */}
          <button
            className="btn-primary mt-5 flex items-center justify-center gap-2"
            onClick={handleApply}
            disabled={loading}
          >
            <SlidersHorizontal size={18} />
            {loading ? "处理中..." : "应用滤镜"}
          </button>
        </>
      )}

      {/* Result */}
      {result && (
        <div className="result-card">
          <p className="text-sm font-medium mb-3">滤镜已应用</p>
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
            处理另一张
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
