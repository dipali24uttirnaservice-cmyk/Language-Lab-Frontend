export default async function ReadingDetailPage({ params }) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');

  return (
    <div className="max-w-4xl mx-auto p-10">
      {/* Navigation Helper */}
      <div className="mb-8">
        <a href="/dashboard/reading" className="text-slate-400 hover:text-slate-900 font-bold text-sm transition-colors">
          ← BACK TO LIBRARY
        </a>
      </div>

      {/* Reader Header */}
      <div className="mb-12 border-b border-slate-200 pb-8">
        <h1 className="text-5xl font-black text-slate-900 capitalize tracking-tight">
         Beginner English
        </h1>
        <div className="flex gap-4 mt-6">
          <span className="px-3 py-1 bg-slate-900 text-white text-[10px] font-black rounded-lg">LEVEL: ADVANCED</span>
          <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg">5 MIN READ</span>
        </div>
      </div>

      {/* Reading Content Area */}
      <article className="prose prose-slate prose-lg max-w-none">
        <p className="text-slate-700 leading-relaxed text-lg">
          {/* Your reading content goes here */}
          Start by diving into the text. This area is designed for maximum focus, 
          using ample white space and clear typography to help you maintain concentration 
          while improving your reading comprehension skills.
        </p>
        <p className="text-slate-700 leading-relaxed text-lg mt-6">
          Phasellus feugiat, eros ac accumsan eleifend, arcu justo egestas nisl, 
          vel porta nunc odio et turpis. Cras dictum, lorem at cursus eleifend, 
          massa nisi pellentesque ex, in ultrices lacus purus vel libero.
        </p>
      </article>

      {/* Action Footer */}
      <div className="mt-16 pt-8 border-t border-slate-200 flex justify-between items-center">
        <p className="text-slate-400 text-xs font-bold uppercase">Ready to check your understanding?</p>
        <button className="bg-emerald-700 text-white px-8 py-3 rounded-2xl font-black text-sm hover:bg-emerald-600 transition-colors">
          COMPLETE LESSON
        </button>
      </div>
    </div>
  );
}