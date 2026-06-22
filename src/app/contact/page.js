"use client";

import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  Building2,
  Headphones,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  return (
    <main className="relative overflow-hidden bg-slate-50">

      {/* Background Effects */}
    {/* Contact Page Background */}
<div className="absolute inset-0 overflow-hidden pointer-events-none">

  {/* Soft Glows */}
  <div className="absolute top-0 left-1/4 h-[450px] w-[450px] rounded-full bg-amber-200/25 blur-[120px]" />

  <div className="absolute bottom-0 right-1/4 h-[450px] w-[450px] rounded-full bg-emerald-200/25 blur-[120px]" />

  {/* Premium Grid */}
  <div
    className="
      absolute inset-0
      bg-[linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)]
      bg-[size:60px_60px]
    "
  />

  {/* Large Glass Square */}
  <div
    className="
      absolute
      top-24
      left-16
      w-44
      h-44
      rounded-[36px]
      border
      border-white/50
      bg-white/30
      backdrop-blur-2xl
      rotate-12
      animate-[contactFloat_10s_ease-in-out_infinite]
    "
  />

  {/* Amber Square */}
  <div
    className="
      absolute
      top-40
      right-20
      w-56
      h-56
      rounded-[42px]
      border
      border-white/40
      bg-gradient-to-br
      from-amber-100/50
      to-orange-100/20
      backdrop-blur-xl
      -rotate-12
      animate-[contactFloat_14s_ease-in-out_infinite]
    "
  />

  {/* Emerald Square */}
  <div
    className="
      absolute
      bottom-24
      right-1/4
      w-48
      h-48
      rounded-[38px]
      border
      border-white/40
      bg-gradient-to-br
      from-emerald-100/40
      to-teal-100/20
      backdrop-blur-xl
      rotate-12
      animate-[contactFloat_12s_ease-in-out_infinite]
    "
  />

  {/* Small Accent Shapes */}
  <div className="absolute top-1/2 left-12 w-6 h-6 rotate-45 bg-amber-400/20 rounded-sm" />

  <div className="absolute top-1/3 right-1/3 w-5 h-5 rotate-45 bg-orange-400/20 rounded-sm" />

  <div className="absolute bottom-1/4 right-10 w-8 h-8 rotate-45 bg-emerald-400/20 rounded-sm" />

</div>

      {/* Hero */}
      <section className="relative z-10 py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">

          <div className="inline-flex items-center rounded-full border border-amber-200 bg-white/60 backdrop-blur-xl px-5 py-2 mb-6">
            <span className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-emerald-600 bg-clip-text text-transparent">
              Contact Our Team
            </span>
          </div>

<h1 className="text-5xl md:text-7xl font-black tracking-tight leading-normal text-slate-900">    Let's Build Better
            <span className="block bg-gradient-to-r from-amber-600 via-orange-500 to-emerald-600 bg-clip-text text-transparent">
              Language Learning
            </span>
          </h1>

          <p className="max-w-3xl mx-auto mt-6 text-lg text-slate-600 leading-relaxed">
            Need a demo, technical support, pricing details, or institution
            onboarding? Our experts are ready to help you transform language
            education with AI.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="relative z-10 max-w-7xl mx-auto px-6">

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">

          {[
            {
              icon: Phone,
              title: "Call Us",
              value: "+91 98765 43210",
            },
            {
              icon: Mail,
              title: "Email",
              value: "support@languagelab.com",
            },
            {
              icon: MapPin,
              title: "Location",
              value: "Pune, Maharashtra",
            },
            {
              icon: Clock,
              title: "Support Hours",
              value: "Mon - Sat | 9AM - 7PM",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-7 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-100 to-emerald-100">

                <item.icon className="w-7 h-7 text-amber-600" />

              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-2 text-slate-600">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="relative z-10 py-24">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid lg:grid-cols-2 gap-10">

            {/* Left */}
            <div>

              <h2 className="text-4xl font-extrabold text-slate-900">
                Get In Touch
              </h2>

              <p className="mt-4 text-slate-600 text-lg">
                Our team responds within 24 hours and helps institutions,
                teachers, and students get the most from our AI-powered
                Language Lab platform.
              </p>

              <div className="mt-10 space-y-6">

                <div className="flex gap-5 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-6">

                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <Building2 className="text-orange-600" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Institution Demo
                    </h4>

                    <p className="text-slate-600 mt-1">
                      Schedule a personalized live demonstration.
                    </p>
                  </div>

                </div>

                <div className="flex gap-5 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-6">

                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                    <Headphones className="text-emerald-600" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Technical Support
                    </h4>

                    <p className="text-slate-600 mt-1">
                      Fast assistance for platform-related issues.
                    </p>
                  </div>

                </div>

                <div className="flex gap-5 rounded-3xl border border-white/60 bg-white/60 backdrop-blur-xl p-6">

                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 flex items-center justify-center">
                    <MessageCircle className="text-cyan-600" />
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Sales Inquiry
                    </h4>

                    <p className="text-slate-600 mt-1">
                      Discuss plans, customization, and deployment.
                    </p>
                  </div>

                </div>

              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-6 mt-10">

                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
                    500+
                  </h3>
                  <p className="text-slate-500">Institutions</p>
                </div>

                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                    50K+
                  </h3>
                  <p className="text-slate-500">Students</p>
                </div>

                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">
                    24/7
                  </h3>
                  <p className="text-slate-500">AI Learning</p>
                </div>

                <div>
                  <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-600 to-cyan-500 bg-clip-text text-transparent">
                    98%
                  </h3>
                  <p className="text-slate-500">Satisfaction</p>
                </div>

              </div>
            </div>

            {/* Right Form */}
            <div className="rounded-[32px] border border-white/60 bg-white/60 backdrop-blur-xl p-8 shadow-xl">

              <h3 className="text-2xl font-bold text-slate-900 mb-6">
                Send a Message
              </h3>

              <form className="space-y-5">

                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-amber-500"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-amber-500"
                />

                <input
                  type="text"
                  placeholder="Institution Name"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-amber-500"
                />

                <textarea
                  rows={6}
                  placeholder="Tell us about your requirement..."
                  className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 outline-none focus:border-amber-500"
                />

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                >
                  <Send size={18} />
                  Send Message
                </button>

              </form>
            </div>

          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 pb-28 px-6">

        <div className="max-w-6xl mx-auto rounded-[40px] overflow-hidden">

          <div className="relative p-14 md:p-20 text-center bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500">

            <h2 className="text-4xl md:text-5xl font-black text-white">
              Ready To Transform Language Learning?
            </h2>

            <p className="mt-5 text-white/90 max-w-3xl mx-auto text-lg">
              Experience the future of language education with AI-powered
              speaking practice, smart assessments, grammar correction,
              and personalized learning paths.
            </p>

            <button className="mt-8 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:scale-105 transition">
              Book Free Demo
            </button>

          </div>
        </div>

      </section>

    </main>
  );
}