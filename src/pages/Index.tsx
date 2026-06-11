import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
  Check,
} from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import heroBefore from "@/assets/hero-before.jpg";
import heroAfter from "@/assets/hero-after.jpg";

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
    quote:
      "It feels less like software and more like a quiet, brilliant studio partner.",
    name: "Rohan Mehta",
    role: "Architect, Mumbai",
  },
  {
    quote:
      "The output quality is genuinely client-ready. A category of its own.",
    name: "Sofia Hahn",
    role: "Stylist, Copenhagen",
  },
];

const pricingTiers = [
  {
    name: "Starter",
    price: "₹900",
    cadence: "/ month",
    perks: ["40 AI generations", "All design themes", "HD exports"],
  },
  {
    name: "Studio",
    price: "₹2,900",
    cadence: "/ month",
    perks: ["160 AI generations", "Priority queue", "No watermark"],
    featured: true,
  },
  {
    name: "Premium",
    price: "₹7,900",
    cadence: "/ month",
    perks: ["400 AI generations", "Commercial license", "Client decks"],
  },
];

const blogPosts = [
  {
    title: "Designing with AI: A Quiet Revolution in Interior Styling",
    slug: "/blog",
    excerpt:
      "How generative models are reshaping the way studios concept rooms — without losing soul.",
  },
  {
    title: "The Japandi Renaissance",
    slug: "/blog",
    excerpt:
      "Why warm minimalism continues to define the next decade of residential design.",
  },
  {
    title: "From Mood Board to Render in 60 Seconds",
    slug: "/blog",
    excerpt:
      "A walkthrough of our client-grade pipeline — from photograph to presentation deck.",
  },
];

const faqs = [
  {
    q: "How does ReRoom AI generate interior designs?",
    a: "Upload a photo of your room and choose a design mood. Our AI, trained on global design archives, transforms your space into a luxury-grade render in seconds.",
  },
  {
    q: "Is ReRoom AI free to try?",
    a: "Yes — every new account receives 4 free credits, no credit card required. Additional credits are available via flexible subscription plans.",
  },
  {
    q: "Which design styles are supported?",
    a: "From Japandi and Scandinavian minimalism to Luxury Elegance, Industrial, and Coastal — every theme is crafted with real designers.",
  },
  {
    q: "Can I use ReRoom AI designs commercially?",
    a: "Yes. Paid plans include commercial usage rights and high-resolution client-ready exports without watermarks.",
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

      <main>
        {/* HERO */}
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
          <div className="container mx-auto px-6 relative grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8 animate-fade-in-up text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/40 bg-card/60 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-accent" />
                <span className="font-subheading text-xs tracking-[0.2em] uppercase text-primary">
                  A Digital Atelier for Spaces
                </span>
              </div>

              <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] text-primary tracking-tight">
                Design Without
                <span className="block italic text-accent">Limits.</span>
              </h1>

              <p className="font-subheading text-xl md:text-2xl text-primary/80 max-w-xl mx-auto lg:mx-0">
                Reimagine your space through AI artistry and human precision.
              </p>
              <p className="text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Upload your space. Select a mood. Watch design intelligence
                unfold.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
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

            {/* Before/After hero loop */}
            <figure
              className="relative aspect-[4/3] rounded-[2rem] overflow-hidden shadow-float border border-accent/20"
              aria-label="Before and after AI room design transformation"
            >
              <img
                src={heroBefore}
                alt="Before and After AI Room Design Transformation — empty living room before"
                width={1536}
                height={1024}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <img
                src={heroAfter}
                alt="Luxury Living Room Redesign by ReRoom AI — Japandi forest green styling"
                width={1536}
                height={1024}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover before-after-loop"
              />
              <figcaption className="absolute bottom-4 left-4 right-4 flex justify-between items-center text-[10px] tracking-[0.25em] uppercase font-subheading text-primary-foreground">
                <span className="px-3 py-1 rounded-full bg-primary/70 backdrop-blur-sm">
                  Before
                </span>
                <span className="px-3 py-1 rounded-full bg-accent/90 text-accent-foreground">
                  After · AI
                </span>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* CORE EXPERIENCE */}
        <section
          className="py-20 md:py-28"
          aria-labelledby="upload-heading"
        >
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
                <h2
                  id="upload-heading"
                  className="font-serif text-3xl md:text-5xl text-primary"
                >
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
                  <span className="text-accent">★</span> 4 Free Credits — No
                  Card Required
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section
          id="features"
          className="py-20 md:py-28 bg-secondary/40"
          aria-labelledby="features-heading"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
                Capability
              </p>
              <h2
                id="features-heading"
                className="font-serif text-3xl md:text-5xl text-primary"
              >
                The Intelligence Behind Beauty.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f) => (
                <article
                  key={f.title}
                  className="rounded-3xl p-10 bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all duration-500"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <f.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-2xl text-primary mb-3">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {f.desc}
                  </p>
                </article>
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/marketplace"
                className="font-subheading text-primary hover:text-accent transition-colors inline-flex items-center gap-2"
              >
                Explore all design themes
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* PRICING PREVIEW */}
        <section
          id="pricing"
          className="py-20 md:py-28"
          aria-labelledby="pricing-heading"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
                Plans
              </p>
              <h2
                id="pricing-heading"
                className="font-serif text-3xl md:text-5xl text-primary"
              >
                Simple, Considered{" "}
                <span className="italic text-accent">Pricing.</span>
              </h2>
              <p className="font-subheading text-muted-foreground mt-4">
                Begin free. Upgrade when your atelier grows.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pricingTiers.map((t) => (
                <article
                  key={t.name}
                  className={`rounded-3xl p-8 bg-card border transition-all ${
                    t.featured
                      ? "border-accent shadow-gold scale-[1.02]"
                      : "border-border/60 shadow-card hover:shadow-elegant"
                  }`}
                >
                  <h3 className="font-serif text-2xl text-primary mb-2">
                    {t.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="font-serif text-4xl text-primary">
                      {t.price}
                    </span>
                    <span className="text-sm text-muted-foreground font-subheading">
                      {t.cadence}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {t.perks.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-sm text-primary/80"
                      >
                        <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/pricing"
                    className={`block text-center rounded-3xl py-3 font-subheading transition-all ${
                      t.featured
                        ? "bg-primary text-primary-foreground hover:shadow-gold"
                        : "border-2 border-primary/20 hover:border-accent text-primary"
                    }`}
                  >
                    Choose {t.name}
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section
          id="about"
          className="py-20 md:py-28 bg-secondary/40"
          aria-labelledby="about-heading"
        >
          <div className="container mx-auto px-6 max-w-4xl text-center">
            <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
              Our Atelier
            </p>
            <h2
              id="about-heading"
              className="font-serif text-3xl md:text-5xl text-primary mb-6"
            >
              Technology Inspired{" "}
              <span className="italic text-accent">by Taste.</span>
            </h2>
            <p className="font-subheading text-lg text-primary/80 leading-relaxed mb-4">
              ReRoom AI was born from a belief that design intelligence should
              feel as considered as the work itself.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We build tools alongside practising interior designers, architects
              and stylists — translating decades of craft into models that
              respect proportion, material and mood. Every render is the
              beginning of a conversation, not the end of one.
            </p>
            <div className="mt-8">
              <Link
                to="/blog"
                className="font-subheading text-primary hover:text-accent transition-colors inline-flex items-center gap-2"
              >
                Read our story on the journal
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section
          className="py-20 md:py-28"
          aria-labelledby="testimonials-heading"
        >
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2
                id="testimonials-heading"
                className="font-serif text-3xl md:text-5xl text-primary"
              >
                Trusted by Design Professionals{" "}
                <span className="italic text-accent">Worldwide.</span>
              </h2>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 font-subheading text-primary">
                <span>12,000+ Rooms Transformed</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span>500+ Designers</span>
                <span className="w-1 h-1 rounded-full bg-accent" />
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-accent text-accent" /> 4.9
                  Average Rating
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
                    <div className="text-sm text-muted-foreground">
                      {t.role}
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* BLOG PREVIEW */}
        <section
          id="journal"
          className="py-20 md:py-28 bg-secondary/40"
          aria-labelledby="journal-heading"
        >
          <div className="container mx-auto px-6">
            <div className="flex items-end justify-between flex-wrap gap-4 mb-12">
              <div>
                <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
                  Journal
                </p>
                <h2
                  id="journal-heading"
                  className="font-serif text-3xl md:text-5xl text-primary"
                >
                  Notes from the Atelier.
                </h2>
              </div>
              <Link
                to="/blog"
                className="font-subheading text-primary hover:text-accent transition-colors inline-flex items-center gap-2"
              >
                View all posts
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {blogPosts.map((p) => (
                <Link
                  key={p.title}
                  to={p.slug}
                  className="group rounded-3xl p-8 bg-card border border-border/60 shadow-card hover:shadow-elegant transition-all"
                >
                  <h3 className="font-serif text-xl text-primary mb-3 group-hover:text-accent transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">
                    {p.excerpt}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-subheading text-sm text-primary group-hover:text-accent transition-colors">
                    Read more <ArrowRight className="w-3 h-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="py-20 md:py-28"
          aria-labelledby="faq-heading"
        >
          <div className="container mx-auto px-6 max-w-3xl">
            <div className="text-center mb-12">
              <p className="font-subheading text-xs tracking-[0.25em] uppercase text-accent mb-4">
                Questions
              </p>
              <h2
                id="faq-heading"
                className="font-serif text-3xl md:text-5xl text-primary"
              >
                Frequently Asked.
              </h2>
            </div>

            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="rounded-2xl border border-border/60 bg-card px-6"
                >
                  <AccordionTrigger className="font-serif text-lg text-primary text-left hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
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
                Begin your journey with AI-powered transformation and 4
                complimentary credits.
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
