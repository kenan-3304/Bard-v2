
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function BarOnboarding() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        capacity: '',
        peak_nights: '', // comma separated for simplicity initially
    })

    const router = useRouter()
    // Create client inside component
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
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

            const peakNightsArray = formData.peak_nights.split(',').map((s) => s.trim())

            const { error } = await supabase.from('bars').insert({
                name: formData.name,
                location: formData.location,
                capacity: parseInt(formData.capacity, 10),
                peak_nights: peakNightsArray,
                owner_id: user.id
            })

            if (error) throw error

            alert('Bar saved successfully!')
            // setFormData({ name: '', location: '', capacity: '', peak_nights: '' })
            router.push('/dashboard/bar')
            router.refresh()
        } catch (error: any) {
            alert('Error saving bar: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Onboard Bar</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Bar Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="The Prancing Pony"
                                required
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                placeholder="Bree"
                                required
                                value={formData.location}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                name="capacity"
                                type="number"
                                placeholder="100"
                                required
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="peak_nights">Peak Nights (comma separated)</Label>
                            <Input
                                id="peak_nights"
                                name="peak_nights"
                                placeholder="Friday, Saturday"
                                value={formData.peak_nights}
                                onChange={handleChange}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Bar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
