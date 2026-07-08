import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — ByteBazaar" },
      { name: "description", content: "Sign in to manage your ByteBazaar products." },
    ],
  }),
  component: LoginPage,
});

interface Values {
  identifier: string;
  password: string;
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Values>();

  const onSubmit = async (v: Values) => {
    try {
      await login(v.identifier, v.password);
      toast.success("Welcome back");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Log in to manage your digital products.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifier">Username or email</Label>
              <Input id="identifier" autoComplete="username" {...register("identifier", { required: "Required" })} />
              {errors.identifier && <p className="text-destructive text-xs">{errors.identifier.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...register("password", { required: "Required" })} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-brand text-primary-foreground w-full shadow-glow hover:opacity-90"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            New here?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
