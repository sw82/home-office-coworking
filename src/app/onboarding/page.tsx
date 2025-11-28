'use client'

import { createClient } from '../../../utils/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

const AMENITIES = [
    { id: 'wifi_5g', label: '5G WiFi', icon: '📶' },
    { id: 'coffee_machine', label: 'Coffee Machine', icon: '☕' },
    { id: 'standing_desk', label: 'Standing Desk', icon: '🪑' },
    { id: 'dual_monitors', label: 'Dual Monitors', icon: '🖥️' },
    { id: 'quiet_space', label: 'Quiet Space', icon: '🤫' },
    { id: 'parking', label: 'Parking', icon: '🚗' },
]

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function OnboardingPage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState(1)

    // Form state
    const [zipcode, setZipcode] = useState('')
    const [bio, setBio] = useState('')
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([])
    const [availability, setAvailability] = useState<Array<{ day: number, start: string, end: string }>>([])

    useEffect(() => {
        checkProfile()
    }, [])

    const checkProfile = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }

        // Check if profile already exists
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profile?.zipcode) {
            router.push('/dashboard')
        }
    }

    const toggleAmenity = (amenityId: string) => {
        setSelectedAmenities(prev =>
            prev.includes(amenityId)
                ? prev.filter(id => id !== amenityId)
                : [...prev, amenityId]
        )
    }

    const addAvailabilitySlot = () => {
        setAvailability([...availability, { day: 1, start: '09:00', end: '17:00' }])
    }

    const removeAvailabilitySlot = (index: number) => {
        setAvailability(availability.filter((_, i) => i !== index))
    }

    const updateAvailabilitySlot = (index: number, field: 'day' | 'start' | 'end', value: string | number) => {
        const updated = [...availability]
        updated[index] = { ...updated[index], [field]: value }
        setAvailability(updated)
    }

    const handleSubmit = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get LinkedIn profile data
            const linkedinProfile = {
                name: user.user_metadata.full_name || user.user_metadata.name,
                photo: user.user_metadata.avatar_url || user.user_metadata.picture,
                headline: user.user_metadata.headline || '',
                company: user.user_metadata.company || '',
            }

            // Geocode zipcode (simplified - in production use a real geocoding API)
            const latitude = 0 // TODO: Implement geocoding
            const longitude = 0

            // Update user profile
            const { error: profileError } = await supabase
                .from('users')
                .upsert({
                    id: user.id,
                    linkedin_profile: linkedinProfile,
                    zipcode,
                    latitude,
                    longitude,
                    bio,
                    amenities: selectedAmenities,
                })

            if (profileError) throw profileError

            // Insert availability slots
            if (availability.length > 0) {
                const { error: availError } = await supabase
                    .from('availability')
                    .insert(
                        availability.map(slot => ({
                            user_id: user.id,
                            day_of_week: slot.day,
                            start_time: slot.start,
                            end_time: slot.end,
                        }))
                    )

                if (availError) throw availError
            }

            router.push('/dashboard')
        } catch (error) {
            console.error('Error saving profile:', error)
            alert('Failed to save profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4">
            <div className="mx-auto max-w-2xl">
                <div className="rounded-2xl bg-white p-8 shadow-2xl">
                    {/* Progress indicator */}
                    <div className="mb-8 flex justify-between">
                        {[1, 2, 3].map(s => (
                            <div key={s} className={`h-2 flex-1 rounded-full mx-1 ${s <= step ? 'bg-purple-600' : 'bg-gray-200'}`} />
                        ))}
                    </div>

                    <h1 className="mb-6 text-3xl font-bold text-gray-900">Complete Your Profile</h1>

                    {/* Step 1: Basic Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Zipcode</label>
                                <input
                                    type="text"
                                    value={zipcode}
                                    onChange={(e) => setZipcode(e.target.value)}
                                    placeholder="e.g., 10001"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Tell others about yourself and what you're working on..."
                                    rows={4}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                                />
                            </div>
                            <button
                                onClick={() => setStep(2)}
                                disabled={!zipcode}
                                className="w-full rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {/* Step 2: Amenities */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <p className="text-gray-600">What can you offer?</p>
                            <div className="grid grid-cols-2 gap-3">
                                {AMENITIES.map(amenity => (
                                    <button
                                        key={amenity.id}
                                        onClick={() => toggleAmenity(amenity.id)}
                                        className={`rounded-lg border-2 p-4 text-left transition-all ${selectedAmenities.includes(amenity.id)
                                                ? 'border-purple-600 bg-purple-50'
                                                : 'border-gray-200 hover:border-purple-300'
                                            }`}
                                    >
                                        <span className="text-2xl">{amenity.icon}</span>
                                        <p className="mt-1 text-sm font-medium">{amenity.label}</p>
                                    </button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Availability */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <p className="text-gray-600">When are you available?</p>
                            {availability.map((slot, index) => (
                                <div key={index} className="flex gap-3 items-end">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                                        <select
                                            value={slot.day}
                                            onChange={(e) => updateAvailabilitySlot(index, 'day', parseInt(e.target.value))}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        >
                                            {DAYS.map((day, i) => (
                                                <option key={i} value={i}>{day}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                                        <input
                                            type="time"
                                            value={slot.start}
                                            onChange={(e) => updateAvailabilitySlot(index, 'start', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                                        <input
                                            type="time"
                                            value={slot.end}
                                            onChange={(e) => updateAvailabilitySlot(index, 'end', e.target.value)}
                                            className="w-full rounded-lg border border-gray-300 px-3 py-2"
                                        />
                                    </div>
                                    <button
                                        onClick={() => removeAvailabilitySlot(index)}
                                        className="rounded-lg bg-red-100 px-3 py-2 text-red-600 hover:bg-red-200"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addAvailabilitySlot}
                                className="w-full rounded-lg border-2 border-dashed border-gray-300 px-6 py-3 text-gray-600 hover:border-purple-400 hover:text-purple-600"
                            >
                                + Add Time Slot
                            </button>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex-1 rounded-lg bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                                >
                                    {loading ? 'Saving...' : 'Complete Setup'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
