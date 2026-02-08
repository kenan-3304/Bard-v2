
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

export default function AgencyOnboarding() {
    const [loading, setLoading] = useState(false)
    const [currentStep, setCurrentStep] = useState(1)

    // New state for verification flow


    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '', // reused for ambassador count
        peakNights: [] as string[], // reused for operational days (optional, or remove)
        openTo: [] as string[] // reused for service areas or similar
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

    const toggleSelection = (field: 'peakNights' | 'openTo', value: string) => {
        setFormData(prev => {
            const current = prev[field]
            const exists = current.includes(value)
            if (exists) {
                return { ...prev, [field]: current.filter((item: string) => item !== value) }
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
                role: 'agency'
            })
            if (profileError) throw profileError

            // Insert agency data
            const { error } = await supabase.from('agencies').insert({
                name: formData.name,
                location: formData.location,
                capacity: formData.capacity ? parseInt(formData.capacity, 10) : 0, // Using capacity column for ambassador count
                owner_id: user.id
            })

            if (error) throw error

            alert("Agency Setup complete! Redirecting...")
            router.refresh()
            router.push('/dashboard/agency')
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
                    Setup your Agency
                </h1>
                <p className="text-lg text-gray-500">
                    Welcome to Deal OS. Configure your agency profile.
                </p>
            </div>

            <Card className="w-full max-w-3xl border-0 shadow-lg bg-white overflow-visible transition-all duration-500">
                <CardContent className="p-8 md:p-10 space-y-10">
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* Section 1: Bar Basics (Smart Lookup) */}
                        <section className="space-y-6">

                            <div className="space-y-6 max-w-xl mx-auto">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">Agency Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Elite Marketing Group"
                                        required
                                        value={formData.name}
                                        onChange={handleTextChange}
                                        className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="location" className="text-gray-700 font-medium">Headquarters (City/State)</Label>
                                    <Input
                                        id="location"
                                        name="location"
                                        placeholder="e.g. Richmond, VA"
                                        required
                                        value={formData.location}
                                        onChange={handleTextChange}
                                        className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-orange-600"
                                    />
                                </div>
                            </div>


                        </section>

                        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            <div className="w-full h-px bg-gray-100" />

                            {/* Section 2: Scale & Reach */}
                            <section className="space-y-6">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="bg-orange-100 p-2 rounded-lg">
                                        <Users className="w-5 h-5 text-orange-700" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Scale & Reach</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="max-w-xs space-y-2">
                                        <Label htmlFor="capacity" className="text-gray-700 font-medium">Approx. Active Ambassadors</Label>
                                        <Input
                                            id="capacity"
                                            name="capacity"
                                            type="number"
                                            placeholder="25"
                                            required
                                            value={formData.capacity}
                                            onChange={handleTextChange}
                                            className="h-11 rounded-lg border-gray-300 focus:ring-2 focus:ring-orange-600"
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="w-full h-px bg-gray-100" />



                            <div className="w-full h-px bg-gray-100" />



                            {/* Submit */}
                            <div className="pt-6 space-y-4">
                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (
                                        <span className="flex items-center gap-2">
                                            Enter Deal OS <ChevronRight className="w-5 h-5" />
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
