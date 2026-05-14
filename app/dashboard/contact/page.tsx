"use client"

import { useState } from "react"
import { Mail, Phone, MessageCircle, Clock, Send, ChevronDown, ChevronUp, CheckCircle } from "lucide-react"

const FAQS = [
  {
    q: "How do I track my shipment?",
    a: "You can track your shipment using the tracking number provided in your dashboard under Orders.",
  },
  {
    q: "How long does the payout take?",
    a: "Payouts are processed within 48 hours after your withdrawal request is approved by our team.",
  },
  {
    q: "How do I connect my Shopify store?",
    a: "Go to Stores in your dashboard, click 'Add Store', and follow the Shopify OAuth flow. It takes less than 2 minutes.",
  },
  {
    q: "What countries do you cover?",
    a: "We currently cover Spain, Italy, Portugal, Romania, Bulgaria, Hungary, Greece, Slovakia, Slovenia and Czech Republic.",
  },
  {
    q: "How do I change my payment method?",
    a: "Go to Finances → My Wallet → Payment Methods to add or update your IBAN, Wise or crypto address.",
  },
]

export default function ContactPage() {
  const [openFaq, setOpenFaq]   = useState<number | null>(null)
  const [sent,    setSent]      = useState(false)
  const [loading, setLoading]   = useState(false)
  const [form,    setForm]      = useState({ name: "", email: "", category: "", subject: "", message: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    setSent(true)
    setLoading(false)
  }

  const INPUT = "w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 transition-colors"

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl">

      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-orange-400" />
          Get Help
        </h1>
        <p className="text-neutral-500 text-sm mt-1">We're here to help! Choose how you'd like to reach us.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Left — contact cards */}
        <div className="space-y-4">

          {/* Email */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Email Support</p>
              <p className="text-neutral-500 text-xs mt-0.5 mb-2">Send us an email and we'll respond within 24 hours</p>
              <a href="mailto:contact@codshipeurope.com"
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors font-medium">
                contact@codshipeurope.com ↗
              </a>
            </div>
          </div>

          {/* Phone */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Phone Support</p>
              <p className="text-neutral-500 text-xs mt-0.5 mb-2">Call us for immediate assistance</p>
              <a href="tel:+212600000000"
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors font-medium">
                +212 6 00 00 00 00 ↗
              </a>
            </div>
          </div>

          {/* Live Chat */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5 text-neutral-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">Live Chat</p>
                <span className="text-[10px] bg-neutral-800 text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded-full">Coming Soon</span>
              </div>
              <p className="text-neutral-500 text-xs mt-0.5 mb-1">Chat with our support team in real-time</p>
              <p className="text-neutral-600 text-xs">Available 24/7</p>
            </div>
          </div>

          {/* Business Hours */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-orange-400" />
              <p className="text-white font-semibold text-sm">Business Hours</p>
            </div>
            <div className="space-y-2">
              {[
                { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM CET" },
                { day: "Saturday",        hours: "10:00 AM – 4:00 PM CET" },
                { day: "Sunday",          hours: "Closed" },
              ].map(({ day, hours }) => (
                <div key={day} className="flex justify-between text-sm">
                  <span className="text-neutral-400">{day}</span>
                  <span className={hours === "Closed" ? "text-red-400" : "text-white"}>{hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — message form */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <Send className="w-4 h-4 text-orange-400" />
            <p className="text-white font-semibold">Send us a Message</p>
          </div>

          {sent ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="text-white font-bold text-lg">Message sent!</p>
              <p className="text-neutral-500 text-sm">We'll get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", category: "", subject: "", message: "" }) }}
                className="text-orange-400 text-sm hover:text-orange-300 transition-colors">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Full Name *</label>
                  <input type="text" placeholder="Your full name" required value={form.name} onChange={set("name")} className={INPUT} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Email Address *</label>
                  <input type="email" placeholder="your@email.com" required value={form.email} onChange={set("email")} className={INPUT} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Category *</label>
                  <select required value={form.category} onChange={set("category")}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-orange-500 transition-colors">
                    <option value="">Select a category</option>
                    <option value="billing">Billing & Payments</option>
                    <option value="technical">Technical Issue</option>
                    <option value="orders">Orders & Shipping</option>
                    <option value="account">Account</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-500 mb-1.5">Subject *</label>
                  <input type="text" placeholder="Brief description" required value={form.subject} onChange={set("subject")} className={INPUT} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-500 mb-1.5">Message *</label>
                <textarea placeholder="Please provide detailed information about your inquiry..." required rows={5}
                  value={form.message} onChange={set("message")}
                  className={INPUT + " resize-none"} />
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all disabled:opacity-60"
                style={{ background: "linear-gradient(135deg,#f97316,#dc2626)" }}>
                {loading ? (
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : <Send className="w-4 h-4" />}
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <MessageCircle className="w-4 h-4 text-orange-400" />
          <p className="text-white font-semibold">Frequently Asked Questions</p>
          <p className="text-neutral-600 text-xs">· Can't find what you're looking for? Contact us!</p>
        </div>
        <div className="divide-y divide-neutral-800">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left gap-4"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-white text-sm font-medium">{faq.q}</span>
                </div>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-neutral-500 flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-neutral-500 flex-shrink-0" />}
              </button>
              {openFaq === i && (
                <p className="text-neutral-400 text-sm pb-4 pl-7">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
