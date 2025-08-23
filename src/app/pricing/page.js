"use client"
import React, { useState } from 'react';
import { Check, Zap, Crown, Rocket, Gift, Calendar, Star, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

const faqs = [
  {
    question: "Is this really completely free?",
    answer: "Yes! Everything is completely free until March 31, 2026. No hidden fees, no credit card required, no usage limits. We want you to experience the full power of Chatrio."
  },
  {
    question: "What happens after March 2026?",
    answer: "We'll introduce our regular pricing plans, but you'll have plenty of advance notice. If you've been using Chatrio, you'll get special early adopter pricing and grandfathered benefits."
  },
  {
    question: "Are there any usage limits during the free period?",
    answer: "No limits! Unlimited conversations, unlimited bots, unlimited websites. Use Chatrio as much as you need to grow your business."
  },
  {
    question: "Can I use this for commercial purposes?",
    answer: "Absolutely! Whether you're a small business, startup, or enterprise, you can use Chatrio commercially during the free period with no restrictions."
  },
  {
    question: "Will my data be safe and secure?",
    answer: "Yes, we maintain the same enterprise-grade security standards during the free period. Your data is encrypted, secure, and never shared with third parties."
  }
];

const PricingPage = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const features = {
    free: [
      "Unlimited chatbot conversations",
      "24/7 customer support automation", 
      "Multi-language support",
      "Custom branding & styling",
      "Website integration (all platforms)",
      "Lead qualification & capture",
      "Analytics dashboard",
      "AI speech bot included",
      "Real-time chat monitoring",
      "Custom conversation flows"
    ],
    starter: [
      "Everything in Free",
      "Advanced analytics & insights",
      "Priority customer support",
      "Custom AI training data",
      "Advanced lead scoring",
      "CRM integrations",
      "Custom webhooks",
      "White-label solution",
      "API access",
      "Advanced customization"
    ],
    pro: [
      "Everything in Starter",
      "Unlimited team members",
      "Advanced AI models",
      "Custom domain hosting",
      "Priority feature requests",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced security features",
      "SLA guarantee",
      "Phone support"
    ]
  };

  const PricingCard = ({ 
    title, 
    subtitle, 
    price, 
    originalPrice, 
    features, 
    isPopular, 
    isCurrentlyFree,
    icon: Icon,
    buttonText,
    buttonStyle
  }) => (
    <div className={`relative glass-effect bg-card border rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:scale-[1.04] group overflow-hidden ${
      isPopular ? 'border-primary shadow-lg scale-105' : 'border-border hover:border-primary/50'
    }`}>
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'radial-gradient(circle at 70% 30%, rgba(0,0,0,0.08), transparent 70%)'}} />
      <div className="text-center mb-6">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-lg ${
          isPopular ? 'bg-gradient' : 'bg-muted'
        }`}>
          <Icon className={`w-8 h-8 ${isPopular ? 'text-white' : 'text-foreground'}`} />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm mb-4">{subtitle}</p>
        <div className="space-y-2">
          {isCurrentlyFree ? (
            <div>
              <div className="text-4xl font-bold text-green-600 mb-1 animate-pulse">FREE</div>
              <div className="text-sm text-muted-foreground">
                Until March 2026
              </div>
              {originalPrice && (
                <div className="text-lg text-muted-foreground line-through">
                  ${originalPrice}/{isAnnual ? 'year' : 'month'}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="text-4xl font-bold text-foreground mb-1">
                ${isAnnual ? price * 10 : price}
                <span className="text-lg text-muted-foreground font-normal">
                  /{isAnnual ? 'year' : 'month'}
                </span>
              </div>
              {isAnnual && (
                <div className="text-sm text-green-600 font-medium">
                  Save ${price * 2} per year
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Link href={'/bot/new'} className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 mb-6 btn-primary-gradient-hover flex items-center justify-center gap-3 hover:text-white ${buttonStyle}`}>
        {buttonText}
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background mt-20 px-4 sm:px-7 md:px-10 pb-15">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-7 md:px-10 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-green-100/60 to-background/0 dark:from-primary/20 dark:via-green-900/20 dark:to-background/0 animate-gradient-fade" />
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-4 py-2 rounded-full text-sm font-medium mb-6 animate-fade-in">
              <Gift className="w-4 h-4" />
              Limited Time Offer - Everything FREE until March 2026!
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
              <span className="bg-text-gradient">Chatrio is 100% free</span>
              <br />
              <span className="text-foreground">No Cost. No Limits.</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Build, launch, and scale your AI chatbot with all features unlocked. No credit card, no hidden fees—completely free until March 2026.
            </p>
            <div className="flex items-center justify-center gap-2 mb-12 animate-fade-in">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                All plans free until <strong className="text-foreground">March 31, 2026</strong>
              </span>
            </div>
            <Link href={'/bot/new'} className='w-fit btn-primary-gradient-hover flex items-center justify-center gap-5 hover:text-white px-5 py-3 bg-primary text-primary-foreground hover:scale-105 rounded-lg custom-transition duration-300 font-semibold text-lg shadow-lg animate-fade-in mx-auto'>
              Get started now
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/* Billing Toggle */}
      <section className="px-4 sm:px-7 md:px-10 mb-12">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-4 mb-16">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isAnnual ? 'bg-primary' : 'bg-muted'}`}
            >
              <div
                className={`absolute top-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${isAnnual ? 'translate-x-7' : 'translate-x-0.5'}`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-foreground' : 'text-muted-foreground'}`}>Annual</span>
            <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full text-xs font-medium">Save 20%</span>
          </div>
        </div>
      </section>
      {/* Pricing Cards */}
      {/* <section className="px-4 sm:px-7 md:px-10 pb-20">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Free Forever"
              subtitle="Perfect for getting started"
              price="0"
              features={features.free}
              isCurrentlyFree={true}
              icon={Zap}
              buttonText="Get Started Free"
              buttonStyle="bg-muted text-foreground hover:bg-muted/80 border border-border"
            />
            <PricingCard
              title="Starter"
              subtitle="For growing businesses"
              price="29"
              originalPrice="29"
              features={features.starter}
              isPopular={true}
              isCurrentlyFree={true}
              icon={Rocket}
              buttonText="Start Free Trial"
              buttonStyle="btn-primary-gradient-hover bg-primary text-primary-foreground hover:text-white hover:scale-105"
            />
            <PricingCard
              title="Pro"
              subtitle="For enterprise teams"
              price="99"
              originalPrice="99"
              features={features.pro}
              isCurrentlyFree={true}
              icon={Crown}
              buttonText="Start Free Trial"
              buttonStyle="bg-muted text-foreground hover:bg-muted/80 border border-border"
            />
          </div>
        </div>
      </section> */}
      {/* Free Until 2026 Banner */}
      <section className="relative py-16 px-4 sm:px-7 md:px-10">
       
        <div className="container mx-auto text-center text-white relative z-10 ">
          <div className="max-w-4xl mx-auto p-10 rounded-2xl shadow-xl bg-primary">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-background">Everything is FREE Until March 2026</h2>
            <p className="text-xl opacity-90 mb-8 text-background/50">We're celebrating our launch by giving you full access to all features, unlimited usage, and premium support - completely free for over a year.</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              <div className="text-background backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">∞</div>
                <div className="text-sm ">Unlimited Conversations</div>
              </div>
              <div className="text-background backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">$0</div>
                <div className="text-sm">Setup & Monthly Fees</div>
              </div>
              <div className="text-background backdrop-blur-sm rounded-xl p-6">
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-sm">Premium Support</div>
              </div>
            </div>
            <Link href={'/bot/new'} className='mx-auto w-fit btn-primary-gradient-hover flex items-center justify-center gap-5 hover:text-white px-10 py-3.5 bg-background text-primary hover:scale-105 rounded-lg custom-transition duration-300 font-semibold text-lg shadow-lg'>
              Claim Your Free Access Now
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-7 md:px-10">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about our free offering</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-card border border-border rounded-xl overflow-hidden transition-all duration-300">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left focus:outline-none transition-colors duration-300 hover:bg-muted group"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  aria-expanded={openFaq === index}
                  aria-controls={`faq-content-${index}`}
                >
                  <span className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors duration-300">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5 text-primary transition-transform duration-300 rotate-180" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform duration-300" />
                  )}
                </button>
                <div
                  id={`faq-content-${index}`}
                  className={`transition-all duration-500 ease-in-out px-6 overflow-hidden ${openFaq === index ? 'max-h-40 py-2 opacity-100' : 'max-h-0 py-0 opacity-0'}`}
                  style={{
                    maxHeight: openFaq === index ? '200px' : '0',
                  }}
                >
                  <p className="text-muted-foreground leading-relaxed text-base animate-fade-in-slow">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-7 md:px-10 bg-primary/90">
        <div className="container mx-auto text-center text-primary-foreground">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of businesses already using Chatrio to automate their customer support and boost conversions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href={'/bot/new'} className='w-fit btn-primary-gradient-hover flex items-center justify-center gap-5 hover:text-white px-10 py-3.5 bg-background text-foreground hover:scale-105 rounded-lg custom-transition duration-300 font-semibold text-lg shadow-lg'>
                Start Building Your Bot
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </Link>
              <Link href={'/'} className="border border-primary-foreground/30 text-primary-foreground px-8 py-4 rounded-lg font-semibold hover:bg-primary-foreground/10 transition-all duration-300">
                View Demo
              </Link>
            </div>
            <div className="mt-8 text-sm opacity-75">
              No credit card required • Setup in 5 minutes • Cancel anytime
            </div>
          </div>
        </div>
      </section>
      <style jsx>{`
        @keyframes gradientFade {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
        .animate-gradient-fade {
          animation: gradientFade 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        .animate-fade-in-slow {
          animation: fade-in 1.2s cubic-bezier(0.4,0,0.2,1) both;
        }
      `}</style>
    </div>
  );
};

export default PricingPage;