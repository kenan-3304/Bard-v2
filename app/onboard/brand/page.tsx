'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Building2, ChevronRight } from 'lucide-react'

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

            router.push('/dashboard/brand')
            router.refresh()
        } catch (error: any) {
            alert('Error saving brand: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
            <div className="text-center mb-10 max-w-2xl">
                <div className="w-12 h-12 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Building2 className="w-6 h-6 text-[#0D9488]" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-3">
                    Setup your Brand
                </h1>
                <p className="text-lg text-slate-500">
                    Welcome to Proof. Configure your brand profile to get started.
                </p>
            </div>

            <Card className="w-full max-w-lg border-slate-200 shadow-sm bg-white rounded-xl">
                <CardContent className="p-8 space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700 font-medium">Brand Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="e.g. Virginia Black Whiskey"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="h-11"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-slate-700 font-medium">Category</Label>
                            <Select
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                                value={formData.category}
                            >
                                <SelectTrigger className="h-11">
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

                        <Button
                            type="submit"
                            className="w-full h-12 text-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-semibold rounded-xl shadow-lg"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (
                                <span className="flex items-center gap-2">
                                    Enter Proof <ChevronRight className="w-5 h-5" />
                                </span>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
