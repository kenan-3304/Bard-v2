
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function BrandOnboarding() {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        role: '',
        state: '',
    })

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
                role: 'brand'
            })
            if (profileError) throw profileError

            const { error } = await supabase.from('brands').insert({
                name: formData.name,
                category: formData.category,
                owner_id: user.id
            })

            if (error) throw error

            alert('Brand saved successfully!')
            // setFormData({ name: '', category: '' })
            router.push('/dashboard/brand')
            router.refresh()
        } catch (error: any) {
            alert('Error saving brand: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Set Up Your Brand</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Brand Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Acme Spirits"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Product Type</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                value={formData.category}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Spirits">Spirits</SelectItem>
                                    <SelectItem value="Beer">Beer</SelectItem>
                                    <SelectItem value="Wine">Wine</SelectItem>
                                    <SelectItem value="Ready-to-Drink / Seltzer">Ready-to-Drink / Seltzer</SelectItem>
                                    <SelectItem value="Non-Alcoholic">Non-Alcoholic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Your Role</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, role: value })}
                                value={formData.role}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Brand Marketing Team">Brand Marketing Team</SelectItem>
                                    <SelectItem value="Brand Ambassador">Brand Ambassador</SelectItem>
                                    <SelectItem value="Field Marketing Agency">Field Marketing Agency</SelectItem>
                                    <SelectItem value="Distributor Rep">Distributor Rep</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="state">Primary Activation State</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, state: value })}
                                value={formData.state}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Virginia">Virginia</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-[#0D9488] hover:bg-[#0D9488]/90 text-white"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
