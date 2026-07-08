import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Sparkles, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="group flex items-center gap-2">
          <span className="bg-gradient-brand grid h-9 w-9 place-items-center rounded-xl shadow-glow transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Byte<span className="text-gradient-brand">Bazaar</span>
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            activeOptions={{ exact: true }}
            className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            Marketplace
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:inline-flex sm:items-center sm:gap-1.5"
                activeProps={{ className: "text-foreground font-medium" }}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <div className="mx-2 hidden h-6 w-px bg-border sm:block" />
              <span className="hidden text-sm text-muted-foreground sm:inline">
                @{user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-gradient-brand text-primary-foreground shadow-glow hover:opacity-90">
                  Sign up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
