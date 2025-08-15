"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How do I create an account?",
    answer: "Click on Register, fill out the form, and follow the instructions."
  },
  {
    question: "How can I book a gaming session?",
    answer: "Go to Games, select a game, and follow the booking steps."
  },
  {
    question: "How do I contact support?",
    answer: "Use the Contact Us page or the live chat for help."
  },
  {
    question: "Is my data safe?",
    answer: "Yes, we use secure protocols and never share your data without consent."
  }
];

export default function FAQPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-black to-slate-900 p-8">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-green-600/10 to-green-800/10 backdrop-blur-sm border-0">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            <HelpCircle className="h-7 w-7 text-green-400" /> FAQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-black/30 rounded-lg p-4 border border-green-700/30">
                <div className="text-lg font-semibold text-green-400 mb-2">{faq.question}</div>
                <div className="text-gray-300">{faq.answer}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
