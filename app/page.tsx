import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 selection:bg-indigo-500/30">
      <nav className="border-b border-white/10 bg-neutral-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight text-white flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white"></div>
            </div>
            Glyph
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/sign-in" 
              className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link 
              href="/sign-up" 
              className="text-sm font-medium bg-white text-neutral-950 px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative flex flex-col items-center justify-center px-6 pt-32 pb-24 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
            Design your ideas with absolute precision.
          </h1>
          <p className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Glyph is the modern editor for developers and designers. Build, iterate, and ship faster with a deeply integrated canvas.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link 
              href="/sign-up" 
              className="h-12 px-8 flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity"
            >
              Start Building Free
            </Link>
            <Link 
              href="/editor" 
              className="h-12 px-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors"
            >
              Go to Editor
            </Link>
          </div>
        </div>
        
        {/* Mockup visual */}
        <div className="relative z-10 w-full max-w-5xl mx-auto mt-24 rounded-2xl border border-white/10 bg-neutral-900/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          <div className="aspect-[16/9] rounded-xl bg-neutral-950 flex items-center justify-center border border-white/5 shadow-inner">
             <p className="text-neutral-600 font-medium">Editor Interface Preview</p>
          </div>
        </div>
      </main>
    </div>
  );
}
