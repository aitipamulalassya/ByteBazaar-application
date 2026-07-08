import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Sign up — ByteBazaar" },
      { name: "description", content: "Create a ByteBazaar account and start publishing." },
    ],
  }),
  component: SignupPage,
});

interface Values {
  username: string;
  email: string;
  password: string;
}

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Values>();

  const onSubmit = async (v: Values) => {
    try {
      await signup(v.username, v.email, v.password);
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-4 py-16">
        <div className="bg-card rounded-2xl border border-border p-8 shadow-card">
          <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Start publishing digital products in minutes.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" {...register("username", { required: "Required", minLength: { value: 3, message: "Min 3 chars" } })} />
              {errors.username && <p className="text-destructive text-xs">{errors.username.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register("email", { required: "Required" })} />
              {errors.email && <p className="text-destructive text-xs">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password", { required: "Required", minLength: { value: 6, message: "Min 6 chars" } })} />
              {errors.password && <p className="text-destructive text-xs">{errors.password.message}</p>}
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-brand text-primary-foreground w-full shadow-glow hover:opacity-90"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </form>

          <p className="text-muted-foreground mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
