import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const quality = parseInt(formData.get("quality") as string) || 75;

    if (!file) {
      return NextResponse.json({ error: "请上传图片" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const format = metadata.format;

    let compressed: Buffer;

    switch (format) {
      case "jpeg":
      case "jpg":
        compressed = await sharp(buffer)
          .jpeg({ quality, mozjpeg: true })
          .toBuffer();
        break;
      case "png":
        compressed = await sharp(buffer)
          .png({ compressionLevel: Math.round((100 - quality) / 10) })
          .toBuffer();
        break;
      case "webp":
        compressed = await sharp(buffer).webp({ quality }).toBuffer();
        break;
      case "gif":
        compressed = await sharp(buffer, { animated: true })
          .gif()
          .toBuffer();
        break;
      default:
        compressed = await sharp(buffer).webp({ quality }).toBuffer();
    }

    const ext = format === "jpeg" ? "jpg" : format || "webp";

    return new NextResponse(new Uint8Array(compressed), {
      headers: {
        "Content-Type": `image/${ext}`,
        "Content-Disposition": `attachment; filename="compressed.${ext}"`,
        "X-Original-Size": String(buffer.length),
        "X-Compressed-Size": String(compressed.length),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "压缩失败，请重试" }, { status: 500 });
  }
}
