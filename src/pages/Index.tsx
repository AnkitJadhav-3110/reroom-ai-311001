import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Upload,
  Camera,
  Wand2,
  ArrowRight,
  Brain,
  Layers,
  ImageIcon,
  Star,
  Quote,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const features = [
  {
    icon: Brain,
    title: "AI Design Engine",
    desc: "Trained on global design archives; learns your taste instantly.",
  },
  {
    icon: Layers,
    title: "Adaptive Styles",
    desc: "From Japandi to Luxury Elegance — crafted by real designers.",
  },
  {
    icon: ImageIcon,
    title: "Client-Grade Outputs",
    desc: "Generate high-resolution before/after decks instantly.",
  },
];

const testimonials = [
  {
    quote:
      "ReRoom AI changed how I present concepts. Clients see the vision in seconds.",
    name: "Anaïs Laurent",
    role: "Interior Designer, Paris",
  },
  {
    quote: "It feels less like software and more like a quiet, brilliant studio partner.",
    name: "Rohan Mehta",
    role: "Architect, Mumbai",
  },
  {
    quote: "The output quality is genuinely client-ready. A category of its own.",
    name: "Sofia Hahn",
    role: "Stylist, Copenhagen",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isScrolled, setIsScrolled] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [scanning, setScanning] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) localStorage.setItem("referral_code", refCode);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) navigate("/dashboard");
    });

    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [navigate, searchParams]);

  const handleUpload = () => {
    setScanning(true);
    setTimeout(() => navigate("/auth"), 1100);
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header sticky isScrolled={isScrolled} />

      {/* HERO */}
      <main>
        <section
          className="relative pt-32 pb-24 md:pt-44 md:pb-32"
          style={{ background: "var(--gradient-hero)" }}
          aria-label="Hero"
        >
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{ background: "var(--gradient-spotlight)" }}
          />
          <div className="container mx-auto px-6 relative">
            <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-card/60 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-subheading text-xs tracking-[0.2em] uppercase text-primary">
                  A Digital Atelier for Spaces
                </span>
              </div>

              <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] text-primary">
                Design Without
                <span className="block italic text-accent">Limits.</span>
              </h1>

              <p className="font-subheading text-xl md:text-2xl text-primary/80 max-w-2xl mx-auto">
                Reimagine your space through AI artistry and human precision.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto tracking-wide">
                Upload your space. Select a mood. Watch design intelligence unfold.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/auth")}
                  className="rounded-3xl px-8 py-6 text-base bg-primary text-primary-foreground hover:shadow-gold transition-all duration-500 group"
                >
                  <Upload className="w-5 h-5 mr-2 group-hover:-translate-y-0.5 transition-transform" />
                  Upload Your Room
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className="rounded-3xl px-8 py-6 text-base border-2 border-primary/30 text-primary hover:bg-primary/5 hover:border-accent transition-all"
                >
                  Try Demo Room
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CORE EXPERIENCE */}
        <section className="py-20 md:py-28" aria-label="Upload your space">
          <div className="container mx-auto px-6">
            <div
              className={`max-w-4xl mx-auto rounded-[2rem] p-10 md:p-16 relative overflow-hidden transition-all duration-500 ${
                dragOver ? "scale-[1.01] shadow-gold" : "shadow-float"
              }`}
              style={{ background: "var(--gradient-card)" }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleUpload();
              }}
            >
              {scanning && (
                <div
                  aria-hidden
                  className="absolute inset-y-0 w-1/3 animate-scan pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, hsl(var(--accent) / 0.35), transparent)",
                  }}
                />
              )}

              <div className="text-center space-y-8 relative">
                <h2 className="font-serif text-3xl md:text-5xl text-primary">
                  Your Space, Reimagined{" "}
                  <span className="italic text-accent">Instantly.</span>
                </h2>
                <p className="font-subheading text-primary/70 text-base md:text-lg">
                  {scanning
                    ? "Analyzing Space…"
                    : "Drop a photo, or choose how you'd like to begin."}
                </p>

                <div className="flex flex-col md:flex-row gap-4 justify-center pt-2">
                  <Button
                    onClick={handleUpload}
                    className="rounded-3xl px-7 py-6 bg-primary text-primary-foreground hover:shadow-gold transition-all"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload from Device
                  </Button>
                  <Button
                    onClick={handleUpload}
                    variant="outline"
                    className="rounded-3xl px-7 py-6 border-2 border-primary/20 hover:border-accent hover:bg-accent/5"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Click from Camera
                  </Button>
                  <Button
                    onClick={() => navigate("/dashboard")}
                    variant="ghost"
                    className="rounded-3xl px-7 py-6 text-primary hover:bg-primary/5"
                  >
                    <Wand2 className="w-4 h-4 mr-2" />
                    Try Demo Room
                  </Button>
                  <input ref={fileRef} type="file" hidden accept="image/*" />
                </div>

                <p className="text-sm font-subheading text-accent-foreground">
                  <span className="text-accent">★</span> 4 Free Credits — No Card Required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES — horizontal scroll */}
        <section
          className="py-20 md:py-28 bg-secondary/40"
          aria-label="The intelligence behind beauty"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
                Capability
              </p>
              <h2 className="font-serif text-3xl md:text-5xl text-primary">
                The Intelligence Behind Beauty.
              </h2>
            </div>

            <div className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 scrollbar-thin">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="snap-center shrink-0 w-[85%] md:w-[420px] rounded-3xl p-10 bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-primary mb-3">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-20 md:py-28" aria-label="Social proof">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="font-serif text-3xl md:text-5xl text-primary">
                Trusted by Design Professionals{" "}
                <span className="italic text-accent">Worldwide.</span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-subheading text-primary">
                <span>12,000+ Rooms Transformed</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span>500+ Designers</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" /> 4.9 Average Rating
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <figure
                  key={t.name}
                  className="rounded-3xl p-8 bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all"
                >
                  <Quote className="w-6 h-6 text-accent mb-4" />
                  <blockquote className="text-primary/90 leading-relaxed font-serif text-lg italic">
                    "{t.quote}"
                  </blockquote>
                  <figcaption className="mt-6 pt-6 border-t border-accent/20">
                    <div className="font-subheading text-primary">{t.name}</div>
                    <div className="text-sm text-muted-foreground">{t.role}</div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* SIGNATURE CTA */}
        <section className="py-20 md:py-32 px-6" aria-label="Start designing">
          <div
            className="container mx-auto max-w-5xl rounded-[2.5rem] py-20 px-8 md:px-16 text-center relative overflow-hidden"
            style={{ background: "var(--gradient-cta)" }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-40"
              style={{ background: "var(--gradient-glow)" }}
            />
            <div className="relative space-y-8">
              <h2 className="font-serif text-3xl md:text-6xl text-primary-foreground leading-tight">
                Welcome to the Future of{" "}
                <span className="italic text-accent">Interior Design.</span>
              </h2>
              <p className="font-subheading text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
                Begin your journey with AI-powered transformation and 4 complimentary credits.
              </p>
              <Button
                size="lg"
                onClick={() => navigate("/auth")}
                className="rounded-3xl px-10 py-7 text-base bg-accent text-accent-foreground hover:bg-accent/90 border-2 border-accent animate-gold-glow group"
              >
                Start Designing
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
