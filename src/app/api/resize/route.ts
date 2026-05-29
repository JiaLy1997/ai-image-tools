import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const width = parseInt(formData.get("width") as string);
    const height = parseInt(formData.get("height") as string);

    if (!file) {
      return NextResponse.json({ error: "请选择图片" }, { status: 400 });
    }

    if (
      !width || !height ||
      width < 1 || height < 1 ||
      width > 16384 || height > 16384
    ) {
      return NextResponse.json(
        { error: "宽高必须在 1-16384 之间" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(buffer).metadata();
    const originalSize = buffer.length;

    const outputFormat = metadata.format as keyof sharp.FormatEnum | undefined;
    let pipeline = sharp(buffer).resize(width, height, { fit: "fill" });

    let contentType = "image/jpeg";
    let ext = "jpg";

    switch (outputFormat) {
      case "png":
        pipeline = pipeline.png();
        contentType = "image/png";
        ext = "png";
        break;
      case "webp":
        pipeline = pipeline.webp({ quality: 92 });
        contentType = "image/webp";
        ext = "webp";
        break;
      case "gif":
        pipeline = pipeline.gif();
        contentType = "image/gif";
        ext = "gif";
        break;
      default:
        pipeline = pipeline.jpeg({ quality: 92, mozjpeg: true });
        break;
    }

    const output = await pipeline.toBuffer();

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="resized.${ext}"`,
        "X-Original-Size": String(originalSize),
        "X-Resized-Size": String(output.length),
        "X-Width": String(width),
        "X-Height": String(height),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "调整失败" }, { status: 500 });
  }
}
