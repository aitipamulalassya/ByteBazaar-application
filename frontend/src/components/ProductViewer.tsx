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
console.log("Viewer Product:", product);
  const previewType = useMemo<ProductFileType>(() => {
    const fileType = product?.file_type?.toLowerCase() ?? "";
    const fileUrl = product?.file_url?.toLowerCase() ?? "";

    if (fileType.includes("pdf") || /\.pdf(?:$|[?#])/.test(fileUrl)) return "pdf";
    if (fileType.includes("image")) return "image";
    if (fileType.includes("video")) return "video";
    if (fileType.includes("text") || fileType.includes("json")) return "text";

    return "other";
  }, [product?.file_type, product?.file_url]);
useEffect(() => {
  console.log("PRODUCT:", product);
}, [product]);
  useEffect(() => {
    const controller = new AbortController();

    if (product && previewType === "text" && product.file_url) {
      setTextContent("Loading...");
      fetch(product.file_url, { signal: controller.signal })
        .then((res) => res.text())
        .then(setTextContent)
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            setTextContent("Unable to load text file.");
          }
        });
    } else {
      setTextContent("");
    }

    return () => controller.abort();
  }, [previewType, product]);

  if (!product) return null;

  return (
    <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
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
              src={product.file_url}
              alt={product.name}
              className="mx-auto block max-h-[70vh] object-contain"
            />
          )}

          {/* Video */}
          {previewType === "video" && (
            <video
              controls
              className="mx-auto block max-h-[70vh] w-full"
              src={product.file_url}
            />
          )}

          {/* PDF */}
          {previewType === "pdf" && (
            <iframe
              src={product.file_url}
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

          {/* Other Files */}
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
              href={product.file_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-1.5 h-4 w-4" />
              Open
            </a>
          </Button>

          <Button size="sm" asChild>
            <a
              href={product.file_url}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="mr-1.5 h-4 w-4" />
              Download
            </a>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
