import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cols = parseInt(formData.get("cols") as string) || 2;
    const gap = parseInt(formData.get("gap") as string) || 0;
    const bgColor = (formData.get("bgColor") as string) || "#ffffff";

    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "files" && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length < 2) {
      return NextResponse.json(
        { error: "至少需要 2 张图片" },
        { status: 400 }
      );
    }

    // Read all images and get metadata
    const images = await Promise.all(
      files.map(async (file) => {
        const buffer = Buffer.from(await file.arrayBuffer());
        const metadata = await sharp(buffer).metadata();
        return {
          buffer,
          width: metadata.width || 0,
          height: metadata.height || 0,
        };
      })
    );

    // Find max cell dimensions
    const maxWidth = Math.max(...images.map((img) => img.width));
    const maxHeight = Math.max(...images.map((img) => img.height));

    const rows = Math.ceil(files.length / cols);
    const totalW = cols * maxWidth + (cols - 1) * gap;
    const totalH = rows * maxHeight + (rows - 1) * gap;

    // Parse background color to RGB
    const hex = bgColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16) || 255;
    const g = parseInt(hex.substring(2, 4), 16) || 255;
    const b = parseInt(hex.substring(4, 6), 16) || 255;

    // Resize all images to same cell size
    const resized = await Promise.all(
      images.map((img) =>
        sharp(img.buffer)
          .resize(maxWidth, maxHeight, {
            fit: "contain",
            background: { r, g, b },
          })
          .toBuffer()
      )
    );

    // Build composite list
    const composites = resized.map((buf, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      return {
        input: buf,
        left: col * (maxWidth + gap),
        top: row * (maxHeight + gap),
      };
    });

    const output = await sharp({
      create: {
        width: totalW,
        height: totalH,
        channels: 3,
        background: { r, g, b },
      },
    })
      .composite(composites)
      .jpeg({ quality: 92, mozjpeg: true })
      .toBuffer();

    return new NextResponse(new Uint8Array(output), {
      headers: {
        "Content-Type": "image/jpeg",
        'Content-Disposition': 'attachment; filename="stitched.jpg"',
        "X-Image-Count": String(files.length),
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "拼接失败" }, { status: 500 });
  }
}
