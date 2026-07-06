import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Header from "@/components/Header";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70 font-body mb-4">
            Error 404
          </p>
          <h1 className="text-6xl md:text-7xl font-serif font-bold text-foreground mb-4">
            Page not found
          </h1>
          <p className="text-lg text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Button asChild size="lg">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return home
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
