export default function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <section className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* Left Side */}

        <div className="hidden lg:flex items-center justify-center p-10">
          <div>
            <h1 className="text-6xl font-bold text-white">
              LanguageLab
            </h1>

            <p className="mt-6 text-slate-400">
              Learn Languages With AI
            </p>
          </div>
        </div>

        {/* Right Side */}

        <div className="flex items-center justify-center p-6">
          <div className="w-full max-w-md">

            <h2 className="text-4xl font-bold text-white">
              {title}
            </h2>

            <p className="mt-2 text-slate-400">
              {subtitle}
            </p>

            {children}
          </div>
        </div>

      </div>
    </section>
  );
}