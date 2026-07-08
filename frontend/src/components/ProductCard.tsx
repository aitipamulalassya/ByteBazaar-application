import type { Product } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video,
  FileType2,
  File,
} from "lucide-react";

const iconMap = {
  pdf: FileText,
  image: ImageIcon,
  video: Video,
  text: FileType2,
  other: File,
} as const;

interface Props {
  product: Product;
  onOpen?: (p: Product) => void;
  onEdit?: (p: Product) => void;
  onDelete?: (p: Product) => void;
  showActions?: boolean;
}

export function ProductCard({
  product,
  onOpen,
  onEdit,
  onDelete,
  showActions,
}: Props) {
  const fileType =
    product.file_type?.includes("pdf")
      ? "pdf"
      : product.file_type?.includes("image")
      ? "image"
      : product.file_type?.includes("video")
      ? "video"
      : product.file_type?.includes("text")
      ? "text"
      : "other";

  const Icon = iconMap[fileType];

  return (
    <article
      onClick={() => onOpen?.(product)}
      className="group bg-card hover:shadow-glow relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border/60 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
    >
      <div className="bg-muted relative  overflow-hidden">
        {product.thumbnail_url ? (
          <img
            src={product.thumbnail_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="bg-gradient-surface grid h-full w-full place-items-center">
            <Icon className="text-muted-foreground h-12 w-12" />
          </div>
        )}

        <span className="bg-background/85 text-foreground absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur">
          <Icon className="h-3.5 w-3.5" />
          {fileType.toUpperCase()}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="line-clamp-1 text-base font-semibold tracking-tight">
          {product.name}
        </h3>

        <p className="text-muted-foreground line-clamp-2 text-sm">
          {product.description}
        </p>

        {showActions && (
          <div
            className="mt-4 flex items-center gap-2 border-t border-border/60 pt-4"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() =>
                onEdit?.(product)
              }
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive flex-1 gap-1.5"
              onClick={() =>
                onDelete?.(product)
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}