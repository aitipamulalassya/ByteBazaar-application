
import { useEffect, useMemo, useState } from "react";
import type { Product, ProductFileType } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Download, ExternalLink, File } from "lucide-react";

interface Props {
  product: Product | null;
  onClose: () => void;
}

export function ProductViewer({ product, onClose }: Props) {
  const [textContent, setTextContent] = useState("");

  const apiBase = import.meta.env.VITE_API_URL;

  // Build URLs only when a product is selected.
  const thumbnailUrl = product
    ? `${apiBase}/api/products/${product.id}/assets/thumbnail`
    : "";

  const fileUrl = product
    ? `${apiBase}/api/products/${product.id}/assets/file`
    : "";

  const downloadUrl = product
    ? `${fileUrl}?download=1`
    : "";

  const previewType = useMemo<ProductFileType>(() => {
    const fileType = product?.file_type?.toLowerCase() ?? "";
    const originalUrl = product?.file_url?.toLowerCase() ?? "";

    if (fileType.includes("pdf") || /\.pdf(?:$|[?#])/.test(originalUrl)) {
      return "pdf";
    }

    if (fileType.includes("image")) return "image";
    if (fileType.includes("video")) return "video";
    if (fileType.includes("text") || fileType.includes("json")) {
      return "text";
    }

    return "other";
  }, [product?.file_type, product?.file_url]);

  useEffect(() => {
    const controller = new AbortController();

    if (product && previewType === "text") {
      setTextContent("Loading...");

      fetch(fileUrl, { signal: controller.signal })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Failed to load file");
          }
          return res.text();
        })
        .then(setTextContent)
        .catch((error: unknown) => {
          if (
            !(error instanceof DOMException &&
              error.name === "AbortError")
          ) {
            setTextContent("Unable to load text file.");
          }
        });
    } else {
      setTextContent("");
    }

    return () => controller.abort();
  }, [product?.id, previewType, fileUrl]);

  if (!product) return null;

  return (
    <Dialog
      open={!!product}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-4xl overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {product.description}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-auto bg-muted/30">
          {/* Image */}
          {previewType === "image" && (
            <img
              src={fileUrl}
              alt={product.name}
              className="mx-auto block max-h-[70vh] object-contain"
            />
          )}

          {/* Video */}
          {previewType === "video" && (
            <video
              controls
              className="mx-auto block max-h-[70vh] w-full"
              src={fileUrl}
            />
          )}

          {/* PDF */}
          {previewType === "pdf" && (
            <iframe
              src={fileUrl}
              title={product.name}
              className="h-[70vh] w-full"
            />
          )}

          {/* Text */}
          {previewType === "text" && (
            <pre className="whitespace-pre-wrap p-6 font-mono text-sm">
              {textContent}
            </pre>
          )}

          {/* Other files */}
          {previewType === "other" && (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <File className="h-16 w-16 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Preview not available for this file type.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t bg-background px-6 py-3">
          <Button variant="outline" size="sm" asChild>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Open
            </a>
          </Button>

          <Button size="sm" asChild>
            <a href={downloadUrl}>
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
