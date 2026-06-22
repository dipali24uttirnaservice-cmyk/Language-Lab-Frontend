"use client";

import { Save, Upload, Lock, Building2, Globe, Mail, Phone, CheckCircle2 } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-7xl mx-auto p-6 md:p-12 bg-slate-50/50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
          <p className="text-slate-500 mt-1">Configure your institution's digital identity and security.</p>
        </div>
        <button className="flex items-center gap-2.5 bg-slate-900 hover:bg-slate-800 text-white px-7 py-3 rounded-xl font-semibold shadow-xl shadow-slate-200 transition-all active:scale-95">
          <Save size={18} /> Save Configuration
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Card: Profile */}
          <section className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-3">
              <Building2 className="text-indigo-600" size={20} /> Institution Details
            </h2>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-8">
              <ModernInput label="institute Name" icon={Building2} />
              <ModernInput label="Email Address" icon={Mail} />
              <ModernInput label="Phone Number" icon={Phone} />
              <ModernInput label="Website URL" icon={Globe} />
            </div>
          </section>

         
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Institution Logo</h2>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all cursor-pointer group">
              <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-slate-400 group-hover:text-indigo-600 transition-colors font-bold text-xl mb-3">
                AC
              </div>
              <p className="text-sm font-semibold text-slate-700">Click to upload</p>
              <p className="text-[10px] text-slate-400 mt-1">SVG, PNG (max 2MB)</p>
            </div>
          </div>

         
        </aside>
      </div>
    </div>
  );
}

function ModernInput({ label, icon: Icon, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <div className="relative">
        {Icon && <Icon size={16} className="absolute left-3.5 top-3.5 text-slate-400" />}
        <input 
          type={type} 
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-900 placeholder:text-slate-300" 
          style={{ paddingLeft: Icon ? "2.75rem" : "1rem" }}
          placeholder={label}
        />
      </div>
    </div>
  );
}