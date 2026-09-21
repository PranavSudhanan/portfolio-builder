import { normalizeDoc } from "./defaults";
import type { PortfolioDoc } from "./types";

/**
 * Share links.
 *
 * A whole document is gzipped and base64url-encoded into the URL fragment, so a
 * portfolio can be handed to someone else without a server ever seeing it. The
 * fragment never leaves the browser in an HTTP request.
 */

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function collect(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    total += value.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

/** Encode a document into a URL-safe string. */
export async function encodeDoc(doc: PortfolioDoc): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(doc));
  if (typeof CompressionStream === "undefined") {
    return `r${toBase64Url(json)}`;
  }
  const stream = new Blob([json as BlobPart]).stream().pipeThrough(new CompressionStream("gzip"));
  return `z${toBase64Url(await collect(stream))}`;
}

/** Decode a string produced by `encodeDoc`. Returns null if it is not valid. */
export async function decodeDoc(payload: string): Promise<PortfolioDoc | null> {
  try {
    const marker = payload[0];
    const body = fromBase64Url(payload.slice(1));
    let json: string;
    if (marker === "z") {
      if (typeof DecompressionStream === "undefined") return null;
      const stream = new Blob([body as BlobPart]).stream().pipeThrough(new DecompressionStream("gzip"));
      json = new TextDecoder().decode(await collect(stream));
    } else if (marker === "r") {
      json = new TextDecoder().decode(body);
    } else {
      return null;
    }
    return normalizeDoc(JSON.parse(json));
  } catch {
    return null;
  }
}

/** Absolute share URL for a document, using the current origin. */
export async function shareUrl(doc: PortfolioDoc): Promise<string> {
  const payload = await encodeDoc(doc);
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/view#d=${payload}`;
}
