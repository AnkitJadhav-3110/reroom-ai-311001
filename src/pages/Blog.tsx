import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import PremiumFooter from "@/components/PremiumFooter";
import Header from "@/components/Header";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  published_at: string | null;
}

const Blog = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("id, title, slug, excerpt, featured_image_url, published_at")
        .eq("is_published", true)
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error fetching posts:", error);
      } else {
        setPosts(data || []);
      }
      setLoading(false);
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-serif font-bold text-foreground mb-4">
              Design Inspiration Blog
            </h1>
            <p className="text-xl text-muted-foreground">
              Tips, trends, and inspiration for AI-powered interior design
            </p>
          </div>

          {loading ? (
            <div className="text-center text-muted-foreground">Loading posts...</div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No blog posts yet</p>
              <p className="text-sm text-muted-foreground">
                Check back soon for design tips and inspiration!
              </p>
            </div>
          ) : (
            <div className="grid gap-8">
              {posts.map((post) => (
                <Card
                  key={post.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/blog/${post.slug}`)}
                >
                  <div className="md:flex">
                    {post.featured_image_url && (
                      <div className="md:w-1/3">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-48 md:h-full object-cover"
                        />
                      </div>
                    )}
                    <div className={`p-6 ${post.featured_image_url ? "md:w-2/3" : "w-full"}`}>
                      <h2 className="text-2xl font-serif font-bold mb-2 hover:text-primary transition-colors">
                        {post.title}
                      </h2>
                      {post.published_at && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(post.published_at), "PPP")}
                        </div>
                      )}
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {post.excerpt || "Read more about this topic..."}
                      </p>
                      <Button variant="ghost" className="p-0 h-auto text-primary">
                        Read More <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <PremiumFooter />
    </div>
  );
};

export default Blog;
