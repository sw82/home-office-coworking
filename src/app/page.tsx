import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Logo/Title */}
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-white">
              Home Office Co-working
            </h1>
            <p className="text-xl text-white/90">
              Connect with neighbors for short co-working sessions
            </p>
          </div>

          {/* Value Proposition */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-lg p-8 space-y-4">
            <p className="text-lg text-white">
              Work from home but miss human interaction? Find verified professionals in your neighborhood for 2-3 hour co-working sessions.
            </p>
            <div className="grid gap-3 text-left text-white/90">
              <div className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>LinkedIn verified professionals</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Nearby neighbors only</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-2xl">✓</span>
                <span>Safe & trusted community</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-4">
            <Link
              href="/login"
              className="block w-full rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-600 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            >
              Get Started with LinkedIn
            </Link>
            <p className="text-sm text-white/70">
              Join our trusted community of home office workers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
