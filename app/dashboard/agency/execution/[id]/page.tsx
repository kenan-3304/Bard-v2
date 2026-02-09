'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Camera, Upload, DollarSign, ChevronLeft, MapPin, Calendar, ShieldCheck, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ExecutionMode() {
    const { id } = useParams()
    const supabase = createClient()
    const [campaign, setCampaign] = useState<any>(null)
    const [venue, setVenue] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentSpend, setCurrentSpend] = useState('')
    const [checklist, setChecklist] = useState<Record<string, boolean>>({})
    const [uploading, setUploading] = useState(false)
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)

    useEffect(() => {
        async function fetchData() {
            const { data: campaignData } = await supabase
                .from('campaigns')
                .select('*, brands(name)')
                .eq('id', id)
                .single()

            setCampaign(campaignData)

            if (campaignData?.venue_id) {
                const { data: venueData } = await supabase
                    .from('venues')
                    .select('*')
                    .eq('id', campaignData.venue_id)
                    .single()
                setVenue(venueData)
            }

            // Initialize checklist from compliance reasoning
            if (campaignData?.compliance_reasoning?.suggested_checklist) {
                const initial: Record<string, boolean> = {}
                campaignData.compliance_reasoning.suggested_checklist.forEach((_: string, i: number) => {
                    initial[`item_${i}`] = false
                })
                setChecklist(initial)
            }

            setLoading(false)
        }
        fetchData()
    }, [id])

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const fileName = `${id}_${Date.now()}_${file.name}`
            const { error } = await supabase.storage
                .from('proofs')
                .upload(fileName, file)

            if (error) throw error

            const { data: urlData } = supabase.storage
                .from('proofs')
                .getPublicUrl(fileName)

            setPhotoUrl(urlData.publicUrl)
            toast.success('Photo uploaded successfully')
        } catch (error: any) {
            toast.error('Upload failed: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    const spendAmount = parseFloat(currentSpend) || 0
    const isOverBudget = spendAmount > 100

    if (loading) return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-slate-200 rounded w-48" />
                <div className="h-4 bg-slate-200 rounded w-96" />
            </div>
        </div>
    )

    if (!campaign) return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
            <p className="text-slate-500">Activation not found.</p>
        </div>
    )

    const checklistItems = campaign.compliance_reasoning?.suggested_checklist || [
        'Ambassador has valid Solicitor Tasting Permit',
        'Bar staff will pour all samples',
        'Sample limits enforced',
        'Product purchases under $100/day',
        'Records maintained for 2 years',
    ]

    return (
        <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-8">
            <div>
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 mb-4">
                    <Link href="/dashboard/agency">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Activations
                    </Link>
                </Button>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{campaign.title}</h1>
                <p className="text-slate-500 text-sm mt-1">Execution checklist and proof collection</p>
            </div>

            {/* Activation Info */}
            <div className="flex items-center gap-4 text-sm text-slate-500">
                {venue && (
                    <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {venue.name}
                    </span>
                )}
                {campaign.proposed_date && (
                    <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(campaign.proposed_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                )}
                <span className="font-medium text-slate-600">{campaign.brands?.name}</span>
            </div>

            {/* Spend Tracker */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[#0D9488]" />
                        Spend Tracker
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <Label className="text-slate-700 font-medium">Current Spend ($)</Label>
                        <Input
                            type="number"
                            placeholder="0.00"
                            value={currentSpend}
                            onChange={(e) => setCurrentSpend(e.target.value)}
                            className={`h-11 font-mono text-lg ${isOverBudget ? 'border-red-300 text-red-600' : 'text-slate-900'}`}
                        />
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">Daily limit: $100.00</span>
                        <span className={`font-semibold ${isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                            ${spendAmount.toFixed(2)} / $100.00
                        </span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all ${isOverBudget ? 'bg-red-500' : spendAmount > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min((spendAmount / 100) * 100, 100)}%` }}
                        />
                    </div>
                    {isOverBudget && (
                        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                            <AlertTriangle className="w-4 h-4" />
                            Exceeds VA ABC daily purchase limit of $100
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Compliance Checklist */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                        Compliance Checklist
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-3">
                        {checklistItems.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-3">
                                <Checkbox
                                    id={`check_${i}`}
                                    checked={checklist[`item_${i}`] || false}
                                    onCheckedChange={(checked) => setChecklist({ ...checklist, [`item_${i}`]: !!checked })}
                                    className="mt-0.5"
                                />
                                <label htmlFor={`check_${i}`} className="text-sm text-slate-700 cursor-pointer leading-relaxed">
                                    {item}
                                </label>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                        <Camera className="w-4 h-4 text-[#0D9488]" />
                        Evidence Photos
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500">Upload photos of the activation for compliance documentation.</p>

                    {photoUrl && (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200">
                            <img src={photoUrl} alt="Evidence" className="w-full h-48 object-cover" />
                        </div>
                    )}

                    <label className="flex flex-col items-center justify-center h-32 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-[#0D9488] hover:bg-[#0D9488]/5 transition-colors">
                        <Upload className="w-6 h-6 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-500">
                            {uploading ? 'Uploading...' : 'Click to upload photo'}
                        </span>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={uploading}
                        />
                    </label>
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4 pb-8">
                <Button
                    onClick={() => toast.success('Activation submitted for review')}
                    className="flex-1 h-12 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-semibold shadow-lg shadow-[#0D9488]/20"
                >
                    Submit Activation
                </Button>
            </div>
        </div>
    )
}
