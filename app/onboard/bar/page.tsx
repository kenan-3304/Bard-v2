
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Store, MapPin, Users, Check, ChevronRight, Info, ShieldCheck, Edit2 } from 'lucide-react'
import PlacesAutocomplete from '@/components/ui/places-autocomplete'

// Options for selection fields
const CROWD_OPTIONS = [
    'Underclassmen',
    'Upperclassmen',
    'Grad / Young Pros'
]

const DAYS = [
    { label: 'Mon', value: 'Monday' },
    { label: 'Tue', value: 'Tuesday' },
    { label: 'Wed', value: 'Wednesday' },
    { label: 'Thu', value: 'Thursday' },
    { label: 'Fri', value: 'Friday' },
    { label: 'Sat', value: 'Saturday' },
    { label: 'Sun', value: 'Sunday' }
]

const OPEN_TO_OPTIONS = [
    'Brand-hosted events',
    'Drink / tab sponsorships',
    'Giveaways / promos',
    'Social media posting'
]

export default function BarOnboarding() {
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // New state for verification flow


    const [formData, setFormData] = useState({
        name: '',
        location: '',
        isCollegeTown: false,
        capacity: '',
        typicalCrowd: [] as string[],
        peakNights: [] as string[],
        openTo: [] as string[]
    })

    // ... (router, supabase, useEffect)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        const checkRole = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile?.role) {
                router.replace(`/dashboard/${profile.role}`)
            }
        }
        checkRole()
    }, [supabase, router])

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const toggleCollegeTown = (val: boolean) => {
        setFormData({ ...formData, isCollegeTown: val })
    }

    const toggleSelection = (field: 'typicalCrowd' | 'peakNights' | 'openTo', value: string) => {
        setFormData(prev => {
            const current = prev[field]
            const exists = current.includes(value)
            if (exists) {
                return { ...prev, [field]: current.filter(item => item !== value) }
            } else {
                return { ...prev, [field]: [...current, value] }
            }
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Upsert profile
            const { error: profileError } = await supabase.from('profiles').upsert({
                id: user.id,
                email: user.email,
                role: 'bar'
            })
            if (profileError) throw profileError

            // Insert bar data
            const { error } = await supabase.from('bars').insert({
                name: formData.name,
                location: formData.location,
                capacity: formData.capacity ? parseInt(formData.capacity, 10) : 0,
                peak_nights: formData.peakNights,
                owner_id: user.id
            })

            if (error) throw error

            alert("Setup complete! Redirecting...")
            router.refresh()
            router.push('/dashboard/bar')
        } catch (error: any) {
            console.error(error)
            alert('Error saving bar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">

            {/* Header */}
            <div className="text-center mb-10 max-w-2xl">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-3">
                    Complete your profile
                </h1>
                <p className="text-lg text-gray-500">
                    Tell us a bit more about your venue.
                </p>
            </div>

            <Card className="w-full max-w-3xl border-0 shadow-lg bg-white overflow-visible transition-all duration-500">
                <CardContent className="p-8 md:p-10 space-y-10">
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* Section 1: Bar Basics (Smart Lookup) */}
                        <section className="space-y-6">

                            <div className="space-y-6 max-w-xl mx-auto">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Bar Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Hokie House"
                                        required
                                        value={formData.name}
                                        onChange={handleTextChange}
                                        className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-gray-700 font-medium">City / State</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Blacksburg, VA"
                                        required
                                        value={formData.location}
                                        onChange={handleTextChange}
                                        className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600"
                                    />
                                </div>
                            </div>

                            {/* College Town Toggle - Keep this part of basics but maybe hide until verified/manual? 
                  Let's show it only if verified or manual entry is active to keep "Find your bar" clean.
              */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 animate-in fade-in duration-500">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-gray-900">Is this a College Town?</span>
                                    </div>
                                    <p className="text-sm text-gray-500">College-town bars receive more activation offers</p>
                                </div>
                                <div className="flex bg-gray-200 p-1 rounded-lg self-start sm:self-center">
                                    <button
                                        type="button"
                                        onClick={() => toggleCollegeTown(true)}
                                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${formData.isCollegeTown
                                            ? 'bg-white text-blue-700 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        Yes
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => toggleCollegeTown(false)}
                                        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${!formData.isCollegeTown
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        No
                                    </button>
                                </div>
                            </div>
                        </section>

                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="w-full h-px bg-gray-100" />

                            {/* Section 2: Crowd & Capacity */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <Users className="w-5 h-5 text-blue-700" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Crowd & Capacity</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="max-w-xs space-y-2">
                                        <Label htmlFor="capacity" className="text-gray-700 font-medium">Approx. Capacity</Label>
                                        <Input
                                            id="capacity"
                                            name="capacity"
                                            type="number"
                                            placeholder="100"
                                            required
                                            value={formData.capacity}
                                            onChange={handleTextChange}
                                            className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-gray-700 font-medium">Typical Crowd</Label>
                                        <div className="flex flex-wrap gap-3">
                                            {CROWD_OPTIONS.map((option) => (
                                                <button
                                                    key={option}
                                                    type="button"
                                                    onClick={() => toggleSelection('typicalCrowd', option)}
                                                    className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${formData.typicalCrowd.includes(option)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                                                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                                                        }`}
                                                >
                                                    {option}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="w-full h-px bg-gray-100" />

                            {/* Section 3: Peak Nights */}
                            <section className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <Info className="w-5 h-5 text-blue-700" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">Peak Nights</h3>
                                    </div>
                                    <span className="text-sm text-gray-500">When your bar is busiest</span>
                                </div>

                                <div className="flex flex-wrap gap-2 sm:gap-4">
                                    {DAYS.map((day) => (
                                        <button
                                            key={day.value}
                                            type="button"
                                            onClick={() => toggleSelection('peakNights', day.value)}
                                            className={`w-12 h-12 rounded-xl border flex items-center justify-center text-sm font-bold transition-all duration-200 ${formData.peakNights.includes(day.value)
                                                ? 'bg-gray-900 border-gray-900 text-white shadow-lg scale-105'
                                                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-900'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <div className="w-full h-px bg-gray-100" />

                            {/* Section 4: What you’re open to */}
                            <section className="space-y-6">
                                <div className="mb-2">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-1">What you’re open to</h3>
                                    <p className="text-sm text-gray-500">You stay in control. Accept only what fits your bar.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {OPEN_TO_OPTIONS.map((option) => (
                                        <div
                                            key={option}
                                            onClick={() => toggleSelection('openTo', option)}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${formData.openTo.includes(option)
                                                ? 'border-blue-600 bg-blue-50/50'
                                                : 'border-gray-100 bg-white hover:border-blue-200'
                                                }`}
                                        >
                                            <span className={`font-medium ${formData.openTo.includes(option) ? 'text-blue-900' : 'text-gray-700'}`}>
                                                {option}
                                            </span>
                                            {formData.openTo.includes(option) && (
                                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <Check className="w-3.5 h-3.5 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Submit */}
                            <div className="pt-6 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (
                                        <span className="flex items-center gap-2">
                                            See available brand offers <ChevronRight className="w-5 h-5" />
                                        </span>
                                    )}
                                </Button>
                                <p className="text-center text-sm text-gray-400">
                                    You can edit this anytime.
                                </p>
                            </div>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
