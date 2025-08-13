import { Hero } from '@/components/Hero';
// import { Features } from '@/components/Features';
// import { HowItWorks } from '@/components/HowItWorks';
// import { Testimonials } from '@/components/Testimonials';
// import { CTASection } from '@/components/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Skip link for accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <main id="main-content">
        <Hero />
        {/* <Features />
        <HowItWorks />
        <Testimonials />
        <CTASection /> */}
      </main>
    </div>
  );
}
