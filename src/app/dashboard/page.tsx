'use client'

import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<any>(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        setUser(user)

        // Check if profile is complete
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (!profile?.zipcode) {
            router.push('/onboarding')
            return
        }

        setProfile(profile)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (!user || !profile) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900">Home Office Co-working</h1>
                        <button
                            onClick={handleLogout}
                            className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="rounded-lg bg-white p-6 shadow">
                    <h2 className="text-xl font-semibold mb-4">Welcome, {profile.linkedin_profile?.name}!</h2>
                    <p className="text-gray-600">Dashboard coming soon... Map view and booking features will be added next.</p>
                </div>
            </main>
        </div>
    )
}
