"use client"

import { HelpCircle, ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click on 'Sign up' in the navigation bar, fill out the registration form with your details, and you'll be ready to join our gaming community in seconds!"
  },
  {
    question: "How can I book a gaming session?",
    answer: "Log in to your account, browse our extensive library of games, select your favorite title, and follow the simple booking process on the game details page."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach us directly through our 'Contact Us' page, join our active Discord community for instant help, or use our live chat feature for real-time assistance."
  },
  {
    question: "Is my data safe?",
    answer: "Absolutely. We employ enterprise-grade security protocols and encryption to ensure your personal information and gaming data are always protected."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-gaming-green selection:text-black">
      {/* Hero Background Effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gaming-green/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative container mx-auto px-4 pt-6 pb-16 md:pt-10 md:pb-24 max-w-4xl">

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="group overflow-hidden rounded-2xl bg-white/5 border border-white/10 hover:border-gaming-green/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(25,255,0,0.05)]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left transition-colors"
              >
                <span className={`text-lg md:text-xl font-bold font-orbitron transition-colors ${openIndex === idx ? 'text-gaming-green' : 'text-white/80 group-hover:text-white'}`}>
                  {faq.question}
                </span>
                <ChevronDown className={`h-5 w-5 text-gaming-green transition-transform duration-500 ${openIndex === idx ? 'rotate-180' : ''}`} />
              </button>

              <div
                className={`transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="p-6 pt-0 text-white/60 leading-relaxed border-t border-white/5 bg-black/20">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-white/40 mb-6">Still have questions?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/support/contactus"
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-gaming-green hover:text-gaming-green font-bold font-orbitron text-sm uppercase tracking-widest transition-all"
            >
              Contact Support
            </a>
            <a
              href="https://discord.gg/56FHDE6F77"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-xl bg-gaming-green text-black font-bold font-orbitron text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(25,255,0,0.2)]"
            >
              Join Our Discord
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
