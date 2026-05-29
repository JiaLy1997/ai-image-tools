import BottomNav from "@/components/BottomNav";
import ToolCard from "@/components/ToolCard";
import {
  Minimize2,
  RefreshCw,
  Crop,
  Type,
  Maximize,
  RotateCw,
  LayoutGrid,
  Palette,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-dvh bg-background">
      {/* Hero */}
      <div className="px-5 pt-10 pb-6">
        <h1 className="text-2xl font-bold">图片工具箱</h1>
        <p className="text-sm text-text-secondary mt-1">
          免费好用，无需下载，手机电脑都能用
        </p>
      </div>

      {/* Tools */}
      <div className="px-4 flex flex-col gap-3">
        <ToolCard
          href="/compress"
          icon={Minimize2}
          title="图片压缩"
          desc="一键压缩图片，保持清晰度"
          color="#007aff"
        />
        <ToolCard
          href="/convert"
          icon={RefreshCw}
          title="格式转换"
          desc="JPG / PNG / WebP / AVIF 互转"
          color="#ff9500"
        />
        <ToolCard
          href="/crop"
          icon={Crop}
          title="图片裁剪"
          desc="常用比例一键裁剪"
          color="#34c759"
        />
        <ToolCard
          href="/watermark"
          icon={Type}
          title="添加水印"
          desc="保护你的图片版权"
          color="#af52de"
        />
        <ToolCard
          href="/resize"
          icon={Maximize}
          title="调整尺寸"
          desc="自定义宽高，等比缩放"
          color="#ff3b30"
        />
        <ToolCard
          href="/rotate"
          icon={RotateCw}
          title="图片旋转"
          desc="任意角度旋转、翻转"
          color="#5ac8fa"
        />
        <ToolCard
          href="/stitch"
          icon={LayoutGrid}
          title="图片拼接"
          desc="多张图片合并为一张"
          color="#ffcc00"
        />
        <ToolCard
          href="/filter"
          icon={Palette}
          title="滤镜调色"
          desc="亮度、对比度、饱和度等"
          color="#ff2d55"
        />
      </div>

      {/* Features */}
      <div className="px-5 mt-8">
        <div className="bg-card rounded-2xl p-4 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-xl font-bold text-primary">免费</p>
            <p className="text-[11px] text-text-secondary mt-0.5">无需付费</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-xl font-bold text-primary">安全</p>
            <p className="text-[11px] text-text-secondary mt-0.5">处理即删</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary">快速</p>
            <p className="text-[11px] text-text-secondary mt-0.5">秒级完成</p>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-text-secondary mt-6 px-6 pb-4">
        所有图片处理后立即删除，不会存储你的任何文件
      </p>

      <BottomNav />
    </div>
  );
}
