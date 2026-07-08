import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { ProductCard } from "@/components/ProductCard";
import { CreateProductModal } from "@/components/CreateProductModal";
import { ProductViewer } from "@/components/ProductViewer";
import { Loader } from "@/components/Loader";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Plus, Package } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Product } from "@/types";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — ByteBazaar" },
      { name: "description", content: "Manage your ByteBazaar products." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { products, loading, deleteProduct } = useProducts();
  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [viewing, setViewing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  // Client-side protection (mock JWT). Server SSR shows nothing meaningful here.
  useEffect(() => {
    if (!authLoading && !isAuthenticated) navigate({ to: "/login" });
  }, [authLoading, isAuthenticated, navigate]);

  const myProducts = useMemo(
  () =>
    products.filter(
      (p) => p.username === user?.username
    ),
  [products, user]
);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <Loader label="Loading dashboard..." />
      </div>
    );
  }

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteProduct(confirmDelete.id);
    toast.success("Product deleted");
    setConfirmDelete(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Hi, <span className="text-gradient-brand">@{user?.username}</span>
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              You have {myProducts.length} product{myProducts.length === 1 ? "" : "s"} published.
            </p>
          </div>
     
          <Button
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
            className="bg-gradient-brand text-primary-foreground gap-1.5 shadow-glow hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Create product
          </Button>
        </div>

        <div className="mt-10">
          {loading ? (
            <Loader />
          ) : myProducts.length === 0 ? (
            <div className="bg-card flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-16 text-center">
              <div className="bg-muted grid h-14 w-14 place-items-center rounded-full">
                <Package className="text-muted-foreground h-7 w-7" />
              </div>
              <h3 className="text-lg font-medium">No products yet</h3>
              <p className="text-muted-foreground max-w-sm text-sm">
                Publish your first digital product and it will instantly appear on the marketplace.
              </p>
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
                className="bg-gradient-brand text-primary-foreground mt-2 gap-1.5"
              >
                <Plus className="h-4 w-4" /> Create your first product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {myProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  showActions
                  onOpen={setViewing}
                  onEdit={(prod) => {
                    setEditing(prod);
                    setModalOpen(true);
                  }}
                  onDelete={setConfirmDelete}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <CreateProductModal
        open={modalOpen}
        editing={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
      />
      <ProductViewer product={viewing} onClose={() => setViewing(null)} />

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{confirmDelete?.name}" from your dashboard and the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
