import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const text = (formData.get("text") as string) || "水印文字";
    const opacity = parseFloat(formData.get("opacity") as string) || 0.4;
    const fontSize = parseInt(formData.get("fontSize") as string) || 36;
    const position = (formData.get("position") as string) || "center";
    const color = (formData.get("color") as string) || "#ffffff";

    if (!file) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;

    // Create watermark SVG
    const svgWidth = width;
    const svgHeight = height;

    let textX: number, textY: number;
    switch (position) {
      case "top-left":
        textX = fontSize;
        textY = fontSize * 2;
        break;
      case "top-right":
        textX = svgWidth - fontSize;
        textY = fontSize * 2;
        break;
      case "bottom-left":
        textX = fontSize;
        textY = svgHeight - fontSize;
        break;
      case "bottom-right":
        textX = svgWidth - fontSize;
        textY = svgHeight - fontSize;
        break;
      case "tile":
        textX = 0;
        textY = 0;
        break;
      default: // center
        textX = svgWidth / 2;
        textY = svgHeight / 2;
    }

    let watermarkSvg: string;

    if (position === "tile") {
      // Tiled watermark
      let patterns = "";
      for (let row = 0; row < Math.ceil(svgHeight / (fontSize * 3)); row++) {
        for (let col = 0; col < Math.ceil(svgWidth / (fontSize * 8)); col++) {
          const x = col * fontSize * 8 + fontSize;
          const y = row * fontSize * 3 + fontSize * 2;
          patterns += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${color}" opacity="${opacity}" font-family="sans-serif" transform="rotate(-30 ${x} ${y})">${text}</text>`;
        }
      }
      watermarkSvg = `<svg width="${svgWidth}" height="${svgHeight}">${patterns}</svg>`;
    } else {
      const anchor =
        position.includes("right")
          ? "end"
          : position.includes("left")
            ? "start"
            : "middle";
      watermarkSvg = `<svg width="${svgWidth}" height="${svgHeight}">
        <text x="${textX}" y="${textY}" font-size="${fontSize}" fill="${color}" opacity="${opacity}" font-family="sans-serif" text-anchor="${anchor}" dominant-baseline="middle">${text}</text>
      </svg>`;
    }

    const result = await sharp(buffer)
      .composite([
        {
          input: Buffer.from(watermarkSvg),
          top: 0,
          left: 0,
        },
      ])
      .jpeg({ quality: 92 })
      .toBuffer();

    return new NextResponse(new Uint8Array(result), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="watermarked.jpg"',
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "添加水印失败" }, { status: 500 });
  }
}
