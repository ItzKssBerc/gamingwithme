"use client"

import { ChevronDown, MessageSquare, Disc as Discord } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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
    <div className="min-h-screen bg-transparent text-white selection:bg-gaming-green selection:text-black">
      <div className="relative container mx-auto px-4 md:px-10 pt-4 pb-16 md:pt-6 md:pb-24 max-w-5xl">

        {/* Tactical Header */}
        <div className="mb-12 md:mb-16">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="h-[1px] w-8 bg-white/[0.1]"></div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 font-orbitron">
              Support Center
            </h2>
            <div className="h-[1px] flex-1 bg-white/[0.1]"></div>
          </div>

          <div className="space-y-4 md:space-y-6">
            <h1 className="text-3xl md:text-5xl font-black font-orbitron text-white tracking-tighter uppercase italic leading-[0.9]">
              Frequently Asked <span className="text-white">Questions</span>
            </h1>
            <p className="text-gray-500 text-base md:text-xl font-medium max-w-2xl leading-relaxed">
              Find answers to common questions about our platform and procedures.
              If you can't find what you're looking for, our support team is ready to help.
            </p>
          </div>
        </div>

        {/* FAQ List */}
        <div className="grid grid-cols-1 gap-4 md:gap-6">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`group overflow-hidden rounded-[24px] md:rounded-[32px] bg-[#070707]/90 border transition-all duration-500 backdrop-blur-sm ${openIndex === idx
                ? 'border-gaming-green/40'
                : 'border-white/[0.05] hover:border-white/[0.1]'
                }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 md:p-8 text-left transition-colors"
              >
                <span className={`text-lg md:text-2xl font-black font-orbitron tracking-tight transition-all duration-500 uppercase ${openIndex === idx ? 'text-gaming-green italic' : 'text-white group-hover:text-gaming-green/80'
                  }`}>
                  {faq.question}
                </span>
                <div className={`p-2 rounded-xl bg-white/[0.05] border border-white/[0.05] text-gaming-green transition-all duration-500 ${openIndex === idx ? 'rotate-180 bg-gaming-green/10 border-gaming-green/20' : ''
                  }`}>
                  <ChevronDown className="h-5 w-5 md:h-6 md:w-6" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${openIndex === idx ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
              >
                <div className="p-6 md:p-8 pt-0 text-gray-400 text-sm md:text-lg leading-relaxed font-medium border-t border-white/[0.05]">
                  <div className="max-w-3xl">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tactical Footer CTA */}
        <div className="mt-20 md:mt-32 relative">
          <div className="relative z-10 p-8 md:p-16 rounded-[40px] bg-[#070707]/90 border border-white/[0.05] backdrop-blur-sm text-center space-y-8 md:space-y-12">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-5xl font-black font-orbitron text-white tracking-tighter uppercase italic leading-tight">
                Still have <span className="text-gaming-green">questions?</span>
              </h3>
              <p className="text-gray-500 text-base md:text-xl font-medium max-w-xl mx-auto leading-relaxed">
                Our support staff are standing by to assist you.
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <Link
                href="/support/contactus"
                className="group relative flex items-center justify-center gap-4 w-full md:w-auto px-10 py-6 rounded-[24px] bg-white/[0.05] border border-white/[0.1] text-white font-black font-orbitron text-sm md:text-base uppercase tracking-widest transition-all duration-500 hover:bg-white/[0.1] hover:border-white/[0.2] overflow-hidden"
              >
                <MessageSquare className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Contact Support</span>
              </Link>

              <a
                href="https://discord.gg/56FHDE6F77"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center gap-4 w-full md:w-auto px-10 py-6 rounded-[24px] bg-white text-black font-black font-orbitron text-sm md:text-base uppercase tracking-widest transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:-translate-y-1 overflow-hidden"
              >
                <Discord className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span>Join Discord</span>
              </a>
            </div>

            <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.4em] italic pt-4">
              Secure connection enabled • 24/7 Monitoring
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
