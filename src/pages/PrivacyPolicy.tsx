import Header from "@/components/Header";
import PremiumFooter from "@/components/PremiumFooter";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-[var(--gradient-hero)]">
      <Header />
      <main className="container mx-auto px-4 py-16 max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-foreground mb-8">
          Privacy Policy
        </h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 11, 2026</p>

        <div className="space-y-8 text-foreground/90 leading-relaxed">
          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly: name, email address, and uploaded room images. We also collect usage data such as design preferences, credit usage, and analytics events automatically.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">2. How We Use Your Information</h2>
            <p>We use your information to: provide and improve the Service; process payments and manage subscriptions; send transactional communications; analyze usage patterns to enhance our AI models; and comply with legal obligations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">3. Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption. Uploaded images are stored in private, encrypted storage buckets. We implement appropriate technical and organizational measures to protect your personal data.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">4. Data Sharing</h2>
            <p>We do not sell your personal information. We may share data with: payment processors (Razorpay) for transaction processing; AI service providers for design generation; and law enforcement when required by law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">5. Cookies & Tracking</h2>
            <p>We use essential cookies for authentication and session management. Analytics cookies help us understand how users interact with the Service. You can control cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">6. Your Rights</h2>
            <p>You have the right to: access your personal data; request correction or deletion; export your data; withdraw consent for optional processing; and lodge a complaint with a supervisory authority.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">7. Data Retention</h2>
            <p>We retain your data for as long as your account is active. Uploaded images and generated designs are retained until you delete them or your account. Payment records are retained as required by applicable tax and financial regulations.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">8. Children's Privacy</h2>
            <p>The Service is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has provided us with personal data, please contact us immediately.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. We will notify you of material changes via email or prominent notice on our website.</p>
          </section>

          <section>
            <h2 className="text-2xl font-serif font-semibold text-foreground mb-3">10. Contact Us</h2>
            <p>For privacy-related inquiries, contact us at <a href="mailto:hello@reroomai.com" className="text-primary hover:underline">hello@reroomai.com</a>.</p>
          </section>
        </div>
      </main>
      <PremiumFooter />
    </div>
  );
};

export default PrivacyPolicy;
