import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

const faqs = [
  {
    question: "What is this project?",
    answer:
      "This is an independent community project built to give Relay Protocol users personal insight into their stats. It's not affiliated with the official Relay team. It's just a tool by and for the community!",
  },
  {
    question: "Why Relay Protocol Stats?",
    answer:
      "Relay Protocol Stats are open source and free to use. Anyone can contribute by submitting a PR and help shape the dashboard to fit what we, as Relay Protocol users, want to see.",
  },
  {
    question: "Why is there no 'Connect Wallet' button?",
    answer:
      "There's no need to connect your wallet. Blockchain data is public, so you can fetch stats directly from the Relay Protocol API. This keeps things simple and safe. No wallet connection required!",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4 text-center">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <Card key={faq.question} className="p-0 overflow-hidden transition-all duration-300">
            <Button
              variant="ghost"
              className="w-full flex justify-between items-center px-4 py-3 text-left text-base font-medium h-auto min-h-[48px]"
              aria-expanded={openIndex === idx}
              aria-controls={`faq-panel-${idx}`}
              onClick={() => handleToggle(idx)}
            >
              <span className="flex-1">{faq.question}</span>
              <span className="ml-2 flex-shrink-0 transition-transform duration-300">
                {openIndex === idx ? "-" : "+"}
              </span>
            </Button>
            <div
              id={`faq-panel-${idx}`}
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === idx ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-4 pb-4 text-gray-700">
                {faq.answer}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}