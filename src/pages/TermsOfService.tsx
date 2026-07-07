import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">
          Terms of Service
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Velora Studios ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">2. Description of Service</h2>
            <p>Velora Studios provides AI-powered interior design generation tools. Users can upload room photos, select design themes, and receive AI-generated redesign suggestions. The Service operates on a credit-based system.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">3. User Accounts</h2>
            <p>You must create an account to use certain features. You are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You must provide accurate information and be at least 18 years old.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">4. Credits & Payments</h2>
            <p>Credits are consumed when generating designs. Subscription plans provide monthly credit allocations. Payments are processed through Razorpay. All purchases are subject to our refund policy — a 7-day money-back guarantee applies to subscription plans.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">5. Intellectual Property</h2>
            <p>You retain ownership of images you upload. AI-generated designs are licensed to you for personal and commercial use upon generation. Velora Studios retains the right to use anonymized, aggregated data to improve our models.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">6. Acceptable Use</h2>
            <p>You agree not to: upload illegal or harmful content; attempt to reverse-engineer the AI models; use automated systems to abuse the Service; or resell generated designs as part of a competing service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">7. Limitation of Liability</h2>
            <p>Velora Studios is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount paid by you in the preceding 12 months.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">8. Termination</h2>
            <p>We may suspend or terminate your account for violation of these terms. You may delete your account at any time. Upon termination, unused credits are forfeited.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">9. Changes to Terms</h2>
            <p>We may update these terms from time to time. Continued use of the Service after changes constitutes acceptance. We will notify users of material changes via email or in-app notification.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">10. Contact</h2>
            <p>For questions about these Terms, contact us at <a href="mailto:hello@velorastudios.com" className="text-primary hover:underline">hello@velorastudios.com</a>.</p>
          </section>
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
};

export default TermsOfService;
