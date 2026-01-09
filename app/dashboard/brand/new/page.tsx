
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

interface Bar {
    id: string
    name: string
    location: string
}

export default function NewCampaign() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [bars, setBars] = useState<Bar[]>([])
    const [selectedBars, setSelectedBars] = useState<string[]>([])
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        total_budget: '',
        start_date: '',
        end_date: '',
        price_per_offer: '', // How much each bar gets (initial offer)
    })

    useEffect(() => {
        async function fetchBars() {
            const { data } = await supabase.from('bars').select('id, name, location')
            if (data) setBars(data)
        }
        fetchBars()
    }, [])

    const handleBarToggle = (barId: string) => {
        setSelectedBars(prev =>
            prev.includes(barId) ? prev.filter(id => id !== barId) : [...prev, barId]
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // 1. Get Brand ID
            const { data: brand } = await supabase
                .from('brands')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!brand) throw new Error('Brand not found')

            // 2. Create Campaign
            const { data: campaign, error: campaignError } = await supabase
                .from('campaigns')
                .insert({
                    brand_id: brand.id,
                    title: formData.title,
                    description: formData.description,
                    total_budget: parseFloat(formData.total_budget || '0'),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                })
                .select()
                .single()

            if (campaignError) throw campaignError

            // 3. Create Offers
            const offersToCreate = selectedBars.map(barId => ({
                campaign_id: campaign.id,
                bar_id: barId,
                price: parseFloat(formData.price_per_offer || '0'),
                status: 'sent',
                bar_notes: '' // Empty initially
            }))

            if (offersToCreate.length > 0) {
                const { error: offersError } = await supabase
                    .from('offers')
                    .insert(offersToCreate)

                if (offersError) throw offersError
            }

            alert('Campaign and Offers created!')
            router.push('/dashboard/brand')
            router.refresh()

        } catch (error: any) {
            alert('Error: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Create New Campaign</CardTitle>
                    <CardDescription>Launch a new campaign and send offers to bars.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Campaign Title</Label>
                            <Input
                                required
                                placeholder="Summer Patio Promo"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Input
                                placeholder="Descriptive details..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Input type="date" required value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Input type="date" required value={formData.end_date} onChange={e => setFormData({ ...formData, end_date: e.target.value })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Total Budget ($)</Label>
                                <Input type="number" required placeholder="5000" value={formData.total_budget} onChange={e => setFormData({ ...formData, total_budget: e.target.value })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Offer Price per Bar ($)</Label>
                                <Input type="number" required placeholder="500" value={formData.price_per_offer} onChange={e => setFormData({ ...formData, price_per_offer: e.target.value })} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <Label className="text-lg">Select Bars to Offer</Label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                                {bars.map(bar => (
                                    <div key={bar.id} className={`flex items-start space-x-3 p-3 rounded border cursor-pointer transition-colors ${selectedBars.includes(bar.id) ? 'bg-blue-50 border-blue-500' : 'hover:bg-gray-50'}`} onClick={() => handleBarToggle(bar.id)}>
                                        <input
                                            type="checkbox"
                                            checked={selectedBars.includes(bar.id)}
                                            readOnly
                                            className="mt-1"
                                        />
                                        <div>
                                            <div className="font-medium">{bar.name}</div>
                                            <div className="text-xs text-gray-500">{bar.location}</div>
                                        </div>
                                    </div>
                                ))}
                                {bars.length === 0 && <p className="text-gray-500 italic">No bars found.</p>}
                            </div>
                            <p className="text-sm text-muted-foreground">Selected: {selectedBars.length} bars</p>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Creating...' : 'Launch Campaign'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
