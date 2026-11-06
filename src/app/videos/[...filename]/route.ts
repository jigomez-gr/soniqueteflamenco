import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Convert a Node fs.ReadStream to a WHATWG ReadableStream safely.
 * When browsers abort/seek during video playback, the controller will not throw
 * "Invalid state: Controller is already closed" as calls are protected by isClosed.
 */
function createSafeWebStream(nodeStream: fs.ReadStream): ReadableStream {
  let isClosed = false;
  return new ReadableStream({
    start(controller) {
      nodeStream.on("data", (chunk) => {
        if (isClosed) return;
        try {
          controller.enqueue(chunk);
        } catch {
          isClosed = true;
          nodeStream.destroy();
        }
      });
      nodeStream.on("end", () => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.close();
        } catch {}
      });
      nodeStream.on("error", (err) => {
        if (isClosed) return;
        isClosed = true;
        try {
          controller.error(err);
        } catch {}
      });
      nodeStream.on("close", () => {
        isClosed = true;
      });
    },
    cancel() {
      isClosed = true;
      nodeStream.destroy();
    },
  });
}

/**
 * Streaming HTTP 206 Partial Content for video/document playback.
 * Serves media from external storage directory (MEDIA_STORAGE_ROOT)
 * and resolves physical path via PostgreSQL (media_assets) or direct filename lookup.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string[] | string }> }
) {
  try {
    const { filename } = await params;
    if (!filename || (Array.isArray(filename) && filename.length === 0)) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    const rawPath = Array.isArray(filename) ? filename.join("/") : String(filename);
    const baseName = Array.isArray(filename) ? filename[filename.length - 1] : String(filename);

    const storageRoot =
      process.env.MEDIA_STORAGE_ROOT || "d:/tmp/antigraviti/soniqueteflamenco/media_base";
    const videosDir =
      process.env.MEDIA_VIDEOS_DIR || path.join(storageRoot, "videos");
    const docsDir =
      process.env.MEDIA_DOCUMENTS_DIR || path.join(storageRoot, "documentos");

    let physicalPath = "";
    let mimeType = "video/mp4";
    if (baseName.endsWith(".jpg") || baseName.endsWith(".jpeg")) {
      mimeType = "image/jpeg";
    } else if (baseName.endsWith(".png")) {
      mimeType = "image/png";
    } else if (baseName.endsWith(".webp")) {
      mimeType = "image/webp";
    }

    // 1. Resolve candidates for physical path
    const candidatePaths: string[] = [];

    try {
      const assetKey = baseName.replace(/\.[^/.]+$/, "");
      const rows: any = await prisma.$queryRaw`
        SELECT physical_path, mime_type 
        FROM ccmfalla.media_assets 
        WHERE key = ${assetKey} OR public_url LIKE ${"%" + baseName} OR physical_path LIKE ${"%" + baseName}
        LIMIT 1
      `;
      if (rows && rows.length > 0) {
        mimeType = rows[0].mime_type || mimeType;
        const dbPath = rows[0].physical_path;
        if (dbPath) {
          candidatePaths.push(dbPath);
          const dbBase = path.basename(dbPath);
          candidatePaths.push(path.join(videosDir, dbBase));
          candidatePaths.push(path.join(docsDir, dbBase));
          candidatePaths.push(`/var/data/salvadora/media/videos/${dbBase}`);
          candidatePaths.push(`/var/data/salvadora/media/documentos/${dbBase}`);
        }
      }
    } catch (dbErr) {
      // Non-blocking fallback to direct filesystem
    }

    // Direct folder lookups with full subpath
    candidatePaths.push(path.join(videosDir, rawPath));
    candidatePaths.push(path.join(docsDir, rawPath));
    candidatePaths.push(path.join(storageRoot, rawPath));
    candidatePaths.push(`/var/data/soniqueteflamenco/media/videos/${rawPath}`);
    candidatePaths.push(`/var/data/soniqueteflamenco/media/documentos/${rawPath}`);
    candidatePaths.push(`/var/data/soniqueteflamenco/media/${rawPath}`);
    candidatePaths.push(path.join(process.cwd(), "public", "videos", rawPath));

    // Fallbacks with baseName and known subdirectories
    candidatePaths.push(path.join(videosDir, baseName));
    candidatePaths.push(path.join(videosDir, "el_espacio_para_mejorar_las_asanas", baseName));
    candidatePaths.push(path.join(videosDir, "nagna_yoga", baseName));
    candidatePaths.push(`/var/data/salvadora/media/videos/el_espacio_para_mejorar_las_asanas/${baseName}`);
    candidatePaths.push(`/var/data/salvadora/media/videos/nagna_yoga/${baseName}`);
    candidatePaths.push(`/var/data/salvadora/media/videos/${baseName}`);
    candidatePaths.push(path.join(process.cwd(), "public", "videos", baseName));

    // Support both itinerario1.mp4 and itinerario-1.mp4 variations
    const hyphenatedName = baseName.replace(/^itinerario(\d+)\.mp4$/i, "itinerario-$1.mp4");
    const dehyphenatedName = baseName.replace(/^itinerario-(\d+)\.mp4$/i, "itinerario$1.mp4");
    for (const altName of [hyphenatedName, dehyphenatedName]) {
      if (altName !== baseName) {
        candidatePaths.push(path.join(videosDir, altName));
        candidatePaths.push(`/var/data/salvadora/media/videos/${altName}`);
        candidatePaths.push(path.join(process.cwd(), "public", "videos", altName));
        candidatePaths.push(path.resolve(process.cwd(), "..", "media_base", "videos", altName));
      }
    }

    // Fallback relative to repository root if media_base or auxiliares is alongside
    candidatePaths.push(path.resolve(process.cwd(), "..", "media_base", "videos", rawPath));
    candidatePaths.push(path.resolve(process.cwd(), "..", "media_base", "videos", "el_espacio_para_mejorar_las_asanas", baseName));
    candidatePaths.push(path.resolve(process.cwd(), "..", "media_base", "videos", "nagna_yoga", baseName));
    candidatePaths.push(path.resolve(process.cwd(), "..", "auxiliares", "viajesprevios", baseName));
    candidatePaths.push(path.join("d:/tmp/antigraviti/salvadora/auxiliares/viajesprevios", baseName));
    candidatePaths.push(`/var/data/salvadora/media/videos/viajesprevios/${baseName}`);

    for (const cand of candidatePaths) {
      if (cand && fs.existsSync(cand)) {
        physicalPath = cand;
        break;
      }
    }

    if (!physicalPath) {
      console.warn(`[Media Stream] Not found: ${rawPath}. Checked paths:`, candidatePaths);
      return new NextResponse(`Media asset not found: ${rawPath}. Please ensure /var/data/salvadora/media/videos/${rawPath} exists on the server.`, { status: 404 });
    }

    const stat = fs.statSync(physicalPath);
    const fileSize = stat.size;
    const range = req.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        return new NextResponse("Requested range not satisfiable", {
          status: 416,
          headers: {
            "Content-Range": `bytes */${fileSize}`,
          },
        });
      }

      const chunkSize = end - start + 1;
      const fileStream = fs.createReadStream(physicalPath, { start, end });
      const webStream = createSafeWebStream(fileStream);

      const headers = new Headers({
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": mimeType,
      });

      return new NextResponse(webStream as any, {
        status: 206,
        headers,
      });
    }

    const fileStream = fs.createReadStream(physicalPath);
    const webStream = createSafeWebStream(fileStream);
    const headers = new Headers({
      "Content-Length": fileSize.toString(),
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
    });

    return new NextResponse(webStream as any, {
      status: 200,
      headers,
    });
  } catch (err: any) {
    console.error("Error streaming media:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
