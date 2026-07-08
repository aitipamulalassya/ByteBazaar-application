
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useProducts } from "@/context/ProductContext";
import type { Product } from "@/types";

import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  editing?: Product | null;
}

interface FormValues {
  name: string;
  description: string;
  thumbnail: FileList;
  file: FileList;
}

export function CreateProductModal({
  open,
  onClose,
  editing,
}: Props) {
  const {
    createProduct,
    updateProduct,
  } = useProducts();

  const {
    register,
    handleSubmit,
    reset,
    formState: {
      isSubmitting,
      errors,
    },
  } = useForm<FormValues>();

  useEffect(() => {
    if (open) {
      reset({
        name: editing?.name ?? "",
        description:
          editing?.description ?? "",
      });
    }
  }, [open, editing, reset]);

  const onSubmit = async (
    values: FormValues
  ) => {
    try {
      if (
        !editing &&
        !values.thumbnail?.[0]
      ) {
        toast.error(
          "Please upload a thumbnail"
        );
        return;
      }

      if (
        !editing &&
        !values.file?.[0]
      ) {
        toast.error(
          "Please upload a digital file"
        );
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "name",
        values.name
      );

      formData.append(
        "description",
        values.description
      );

      if (
        values.thumbnail?.[0]
      ) {
        formData.append(
          "thumbnail",
          values.thumbnail[0]
        );
      }

      if (values.file?.[0]) {
        formData.append(
          "productFile",
          values.file[0]
        );
      }

      if (editing) {
        await updateProduct(
          editing.id,
          formData
        );

        toast.success(
          "Product updated"
        );
      } else {
        await createProduct(
          formData
        );

        toast.success(
          "Product published"
        );
      }

      onClose();
    } catch (error) {
      console.error(error);

      toast.error(
        "Something went wrong"
      );
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) =>
        !o && onClose()
      }
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editing
              ? "Edit product"
              : "Publish a new product"}
          </DialogTitle>

          <DialogDescription>
            {editing
              ? "Update your product details."
              : "Share your digital product with the world."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">
              Product name
            </Label>

            <Input
  id="name"
  placeholder="e.g. Neon UI Kit"
  {...register("name", {
    required: "Name is required",
  })}
/>

            {errors.name && (
              <p className="text-destructive text-xs">
                {
                  errors.name
                    .message
                }
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">
              Description
            </Label>

            <Textarea
              id="description"
              rows={3}
              placeholder="What's inside? Who is it for?"
              {...register(
                "description",
                {
                  required:
                    "Description is required",
                }
              )}
            />

            {errors.description && (
              <p className="text-destructive text-xs">
                {
                  errors
                    .description
                    .message
                }
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="thumbnail">
                Thumbnail
              </Label>

              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                {...register(
                  "thumbnail"
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="file">
                Digital file
              </Label>

              <Input
                id="file"
                type="file"
                {...register(
                  "file"
                )}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={
                isSubmitting
              }
              className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90"
            >
              {isSubmitting
                ? "Publishing..."
                : editing
                ? "Save changes"
                : "Publish product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

