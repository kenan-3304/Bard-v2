'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Mail, Phone, ShieldCheck, Users } from 'lucide-react'
import { toast } from 'sonner'

export default function AgencyAmbassadors() {
    const supabase = createClient()
    const [ambassadors, setAmbassadors] = useState<any[]>([])
    const [permits, setPermits] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        permit_number: '',
        permit_expiry: '',
    })

    async function fetchData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: agency } = await supabase
            .from('agencies')
            .select('id')
            .eq('owner_id', user.id)
            .single()

        if (!agency) return

        const { data: ambassadorData } = await supabase
            .from('ambassadors')
            .select('*')
            .eq('agency_id', agency.id)
            .order('created_at', { ascending: false })

        setAmbassadors(ambassadorData || [])

        if (ambassadorData && ambassadorData.length > 0) {
            const ids = ambassadorData.map(a => a.id)
            const { data: permitData } = await supabase
                .from('permits')
                .select('*')
                .in('ambassador_id', ids)

            setPermits(permitData || [])
        }

        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const getPermitForAmbassador = (ambassadorId: string) => {
        return permits.find(p => p.ambassador_id === ambassadorId)
    }

    const getPermitBadge = (permit: any) => {
        if (!permit) return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">No Permit</span>
        if (permit.status === 'expired' || new Date(permit.expiration_date) < new Date()) {
            return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-red-200">Expired</span>
        }
        const daysUntilExpiry = Math.floor((new Date(permit.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        if (daysUntilExpiry <= 30) {
            return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">Expiring ({daysUntilExpiry}d)</span>
        }
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">Valid</span>
    }

    const handleAddAmbassador = async () => {
        if (!formData.first_name || !formData.last_name) return

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: agency } = await supabase
                .from('agencies')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!agency) throw new Error('Agency not found')

            const { data: ambassador, error } = await supabase
                .from('ambassadors')
                .insert({
                    agency_id: agency.id,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email || null,
                    phone: formData.phone || null,
                })
                .select()
                .single()

            if (error) throw error

            // Add permit if provided
            if (formData.permit_number && formData.permit_expiry) {
                await supabase
                    .from('permits')
                    .insert({
                        ambassador_id: ambassador.id,
                        permit_number: formData.permit_number,
                        expiration_date: formData.permit_expiry,
                        state: 'VA',
                        status: 'valid',
                    })
            }

            toast.success('Ambassador added successfully')
            setShowForm(false)
            setFormData({ first_name: '', last_name: '', email: '', phone: '', permit_number: '', permit_expiry: '' })
            fetchData()
        } catch (error: any) {
            toast.error('Error: ' + error.message)
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Ambassadors</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your team and their permit status.</p>
                </div>
                <Button onClick={() => setShowForm(!showForm)} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ambassador
                </Button>
            </div>

            {/* Add Ambassador Form */}
            {showForm && (
                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardHeader className="pb-4 border-b border-slate-100">
                        <CardTitle className="text-lg font-semibold text-slate-900">New Ambassador</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">First Name</Label>
                                <Input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Last Name</Label>
                                <Input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} className="h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Email</Label>
                                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="h-11" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Phone</Label>
                                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="h-11" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Solicitor Tasting Permit #</Label>
                                <Input value={formData.permit_number} onChange={e => setFormData({ ...formData, permit_number: e.target.value })} className="h-11" placeholder="Optional" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Permit Expiry</Label>
                                <Input type="date" value={formData.permit_expiry} onChange={e => setFormData({ ...formData, permit_expiry: e.target.value })} className="h-11" />
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <Button onClick={handleAddAmbassador} className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white">Save Ambassador</Button>
                            <Button variant="outline" onClick={() => setShowForm(false)} className="border-slate-200 text-slate-700">Cancel</Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Ambassador Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ambassadors.map((ambassador) => {
                    const permit = getPermitForAmbassador(ambassador.id)
                    return (
                        <Card key={ambassador.id} className="bg-white border-slate-200 shadow-sm rounded-xl hover:shadow-md transition-shadow">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                                            {ambassador.first_name[0]}{ambassador.last_name[0]}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{ambassador.first_name} {ambassador.last_name}</h3>
                                            <p className="text-xs text-slate-500 capitalize">{ambassador.status}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    {ambassador.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            {ambassador.email}
                                        </div>
                                    )}
                                    {ambassador.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            {ambassador.phone}
                                        </div>
                                    )}
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        Permit
                                    </div>
                                    {getPermitBadge(permit)}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {!loading && ambassadors.length === 0 && !showForm && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No ambassadors yet.</p>
                    <p className="text-slate-400 text-sm mt-1">Add your first ambassador to get started.</p>
                </div>
            )}
        </div>
    )
}
