'use client'

import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const handleLogin = async () => {
        setLoading(true)
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'linkedin_oidc',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })

        if (error) {
            console.error('Login error:', error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-xl">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                        Welcome to Co-Work
                    </h1>
                    <p className="mt-2 text-slate-600">
                        Connect with local professionals for a productive day.
                    </p>
                </div>

                <div className="mt-8 space-y-4">
                    <button
                        onClick={handleLogin}
                        disabled={loading}
                        className="flex w-full items-center justify-center rounded-lg bg-[#0077b5] px-4 py-3 text-white transition-colors hover:bg-[#006097] disabled:opacity-70"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <svg
                                className="mr-2 h-5 w-5 fill-current"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        )}
                        {loading ? 'Connecting...' : 'Sign in with LinkedIn'}
                    </button>
                    <p className="text-center text-xs text-slate-500">
                        By signing in, you agree to our Code of Conduct and Privacy Policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
