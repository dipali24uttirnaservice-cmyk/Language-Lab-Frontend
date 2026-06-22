"use client";

import FAQItem from "@/components/molecules/FAQItem";

const faqs = [
  {
    question: "How does the AI Tutor work behind the scenes?",
    answer:
      "Our AI Tutor system combines large language models with personalized cognitive mapping to analyze your messages instantly. It doesn't just fix errors; it builds deep, contextual reference charts, custom real-world vocabulary templates, and speech exercises shaped exclusively around your actual weaknesses.",
  },
  {
    question: "Can I learn multiple languages simultaneously?",
    answer:
      "Absolutely! You have full access to switch fluidly across our complete library of supported world languages without losing your historic analytical dashboard progress files in your home language hub.",
  },
  {
    question: "Do I receive authentic certificates of mastery?",
    answer:
      "Yes. Upon passing the final diagnostic performance checks within each structured language track, you will be awarded a cryptographically secure certificate to display on your resume or corporate professional networks.",
  },
  {
    question: "Can I cancel my membership subscription plan?",
    answer:
      "Yes. You retain absolute control over your plan. You can cancel, downscale, or modify your premium tier configuration inside your account billing settings screen at any point without hidden fee traps.",
  },
];

export default function FAQSection() {
  return (
    <section className="relative py-32 overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100/40 to-amber-50/10">
      
      {/* =========================================================================
          STRUCTURAL REFRACTION CORE BACKDROP
          ========================================================================= */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none overflow-hidden">
        {/* Soft Sunny Light Accents */}
        <div className="absolute top-1/3 right-[-5%] h-[500px] w-[500px] rounded-full bg-amber-200/20 blur-[130px]" />
        <div className="absolute bottom-1/4 left-[-10%] h-[550px] w-[550px] rounded-full bg-emerald-200/15 blur-[120px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-6">

        {/* Section Header */}
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight sm:text-5xl">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="mt-4 text-lg font-medium text-slate-500">
            Everything you need to know about starting your accelerated journey to absolute conversation fluency.
          </p>
        </div>

        {/* Accordion Stream Stack Container */}
        <div className="space-y-4 relative">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              question={faq.question}
              answer={faq.answer}
            />
          ))}
        </div>

      </div>
    </section>
  );
}