
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
                    <CardTitle>Onboard Brand</CardTitle>
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
                            <Label htmlFor="category">Category</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                value={formData.category}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beer">Beer</SelectItem>
                                    <SelectItem value="Spirits">Spirits</SelectItem>
                                    <SelectItem value="RTD">RTD</SelectItem>
                                    <SelectItem value="Wine">Wine</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Brand'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
