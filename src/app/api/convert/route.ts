import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const targetFormat = (formData.get("format") as string)?.toLowerCase();

    if (!file) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    if (!targetFormat || !MIME_TYPES[targetFormat]) {
      return NextResponse.json(
        { error: "请选择目标格式（jpg/png/webp/avif）" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let converted: Buffer;

    switch (targetFormat) {
      case "jpg":
      case "jpeg":
        converted = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        break;
      case "png":
        converted = await sharp(buffer).png().toBuffer();
        break;
      case "webp":
        converted = await sharp(buffer).webp({ quality: 90 }).toBuffer();
        break;
      case "avif":
        converted = await sharp(buffer).avif({ quality: 80 }).toBuffer();
        break;
      default:
        converted = await sharp(buffer).webp({ quality: 90 }).toBuffer();
    }

    return new NextResponse(new Uint8Array(converted), {
      headers: {
        "Content-Type": MIME_TYPES[targetFormat],
        "Content-Disposition": `attachment; filename="converted.${targetFormat}"`,
        "X-Original-Size": String(buffer.length),
        "X-Converted-Size": String(converted.length),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "转换失败，请重试" }, { status: 500 });
  }
}
