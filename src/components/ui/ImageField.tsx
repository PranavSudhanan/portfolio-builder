"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Label } from "./Field";

/** Uploads above this produce a document too large to keep in localStorage. */
const MAX_UPLOAD_BYTES = 600 * 1024;

/**
 * Image input accepting either a URL or a local file.
 *
 * Local files are inlined as data URIs so a portfolio stays a single portable
 * JSON document with no asset hosting to arrange — at the cost of size, which is
 * why uploads are capped and downscaled first.
 */
export function ImageField({
  label = "Image",
  value,
  onChange,
  help,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  help?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    setError("");
    if (!file.type.startsWith("image/")) {
      setError("That file is not an image.");
      return;
    }
    setBusy(true);
    try {
      const dataUri = await downscale(file, 1400, 0.82);
      const bytes = Math.round((dataUri.length * 3) / 4);
      if (bytes > MAX_UPLOAD_BYTES) {
        setError(
          `Still ${formatBytes(bytes)} after compression — too large to store. Host it somewhere and paste the URL instead.`,
        );
        return;
      }
      onChange(dataUri);
    } catch {
      setError("Could not read that image.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-start gap-2">
        {value ? (
          <div className="relative size-[46px] shrink-0 overflow-hidden rounded-lg border border-[var(--color-edge)]">
            {/* eslint-disable-next-line @next/next/no-img-element -- arbitrary URL or data URI */}
            <img src={value} alt="" className="size-full object-cover" />
          </div>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <input
            className="ui-input"
            value={value.startsWith("data:") ? "" : value}
            placeholder={value.startsWith("data:") ? "Uploaded image" : "https://…"}
            onChange={(e) => onChange(e.target.value)}
            disabled={value.startsWith("data:")}
          />
          <div className="flex gap-1.5">
            <button
              type="button"
              className="ui-btn flex-1"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              <Upload size={13} />
              {busy ? "Processing…" : "Upload"}
            </button>
            {value ? (
              <button type="button" className="ui-icon-btn" data-tone="danger" onClick={() => onChange("")} aria-label="Remove image">
                <X size={14} />
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error ? <p className="ui-help text-[var(--color-amber)]">{error}</p> : null}
      {help && !error ? <p className="ui-help">{help}</p> : null}
    </div>
  );
}

/** Re-encode an image at a bounded width to keep data URIs small. */
function downscale(file: File, maxWidth: number, quality: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read failed"));
    reader.onload = () => {
      const source = String(reader.result);
      // SVGs and GIFs lose meaning when rasterised, so pass them through as-is.
      if (file.type === "image/svg+xml" || file.type === "image/gif") {
        resolve(source);
        return;
      }
      const image = new Image();
      image.onerror = () => reject(new Error("decode failed"));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) {
          resolve(source);
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      image.src = source;
    };
    reader.readAsDataURL(file);
  });
}
