'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Loader2, ArrowRight, Info } from 'lucide-react'

interface Venue {
    id: string
    name: string
    location: string
    city: string
}

interface ComplianceResult {
    compliance_status: 'compliant' | 'conditional' | 'blocked'
    reasoning: string[]
    required_permits: string[]
    required_forms: { name: string; url: string }[]
    suggested_checklist: string[]
    legal_alternatives: string[]
    ai_powered: boolean
}

export default function NewActivation() {
    const router = useRouter()
    const supabase = createClient()
    const [step, setStep] = useState<'form' | 'checking' | 'results'>('form')
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [venues, setVenues] = useState<Venue[]>([])
    const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null)

    const [formData, setFormData] = useState({
        title: '',
        activation_type: 'tasting',
        venue_id: '',
        city: '',
        proposed_date: '',
        description: '',
    })

    useEffect(() => {
        async function fetchVenues() {
            const { data } = await supabase.from('venues').select('id, name, location, city')
            if (data) setVenues(data)
        }
        fetchVenues()
    }, [])

    const selectedVenue = venues.find(v => v.id === formData.venue_id)

    const handleComplianceCheck = async () => {
        if (!formData.title || !formData.activation_type) return
        setStep('checking')
        setLoading(true)

        try {
            const res = await fetch('/api/compliance-check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    activation_type: formData.activation_type,
                    venue_name: selectedVenue?.name || 'TBD',
                    city: formData.city || selectedVenue?.city || 'Virginia',
                    proposed_date: formData.proposed_date,
                    description: formData.description,
                }),
            })

            const data = await res.json()
            setComplianceResult(data)
            setStep('results')
        } catch (error) {
            console.error('Compliance check failed:', error)
            setStep('form')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveActivation = async () => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data: brand } = await supabase
                .from('brands')
                .select('id')
                .eq('owner_id', user.id)
                .single()

            if (!brand) throw new Error('Brand not found')

            const { data: campaign, error } = await supabase
                .from('campaigns')
                .insert({
                    brand_id: brand.id,
                    title: formData.title,
                    description: formData.description,
                    activation_type: formData.activation_type,
                    venue_id: formData.venue_id || null,
                    city: formData.city || selectedVenue?.city || null,
                    state: 'Virginia',
                    proposed_date: formData.proposed_date || null,
                    status: complianceResult?.compliance_status === 'blocked' ? 'draft' : 'active',
                    compliance_status: complianceResult?.compliance_status || 'pending',
                    compliance_reasoning: complianceResult ? {
                        status: complianceResult.compliance_status,
                        reasoning: complianceResult.reasoning,
                        required_permits: complianceResult.required_permits,
                        required_forms: complianceResult.required_forms,
                        suggested_checklist: complianceResult.suggested_checklist,
                        legal_alternatives: complianceResult.legal_alternatives,
                        ai_powered: complianceResult.ai_powered,
                        checked_at: new Date().toISOString(),
                    } : null,
                })
                .select()
                .single()

            if (error) throw error

            router.push(`/dashboard/brand/activation/${campaign.id}`)
            router.refresh()
        } catch (error: any) {
            alert('Error saving activation: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    // Form Step
    if (step === 'form') {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
                <div>
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 mb-4">
                        <Link href="/dashboard/brand">
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Back to Dashboard
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">New Activation</h1>
                    <p className="text-slate-500 text-sm mt-1">Plan your activation and run an AI compliance check before proceeding.</p>
                </div>

                <div className="max-w-2xl">
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="border-b border-slate-100 pb-4">
                            <CardTitle className="text-lg font-semibold text-slate-900">Activation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Activation Name</Label>
                                <Input
                                    placeholder="e.g. Summer Tasting Series at The Cellar"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-11 text-slate-900"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Activation Type</Label>
                                <Select value={formData.activation_type} onValueChange={(v) => setFormData({ ...formData, activation_type: v })}>
                                    <SelectTrigger className="h-11 text-slate-900">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="tasting">Tasting</SelectItem>
                                        <SelectItem value="sponsored_event">Sponsored Event</SelectItem>
                                        <SelectItem value="ambassador_visit">Ambassador Visit</SelectItem>
                                        <SelectItem value="brand_promotion">Brand Promotion</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Venue</Label>
                                <Select value={formData.venue_id} onValueChange={(v) => setFormData({ ...formData, venue_id: v })}>
                                    <SelectTrigger className="h-11 text-slate-900">
                                        <SelectValue placeholder="Select a venue..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {venues.map(venue => (
                                            <SelectItem key={venue.id} value={venue.id}>
                                                {venue.name} - {venue.location || venue.city || 'Virginia'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-medium">City</Label>
                                    <Input
                                        placeholder="e.g. Richmond"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className="h-11 text-slate-900"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-700 font-medium">Proposed Date</Label>
                                    <Input
                                        type="date"
                                        value={formData.proposed_date}
                                        onChange={(e) => setFormData({ ...formData, proposed_date: e.target.value })}
                                        className="h-11 text-slate-900"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-slate-700 font-medium">Description</Label>
                                <Textarea
                                    placeholder="Describe the activation plan in detail. Include what the ambassador will do, what materials you'll bring, and any special circumstances..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={5}
                                    className="resize-none text-slate-900"
                                />
                                <p className="text-xs text-slate-400">The more detail you provide, the more accurate the compliance analysis will be.</p>
                            </div>
                        </CardContent>
                        <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-xl">
                            <Button
                                onClick={handleComplianceCheck}
                                disabled={!formData.title || !formData.activation_type}
                                className="w-full h-12 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-base font-semibold shadow-lg shadow-[#0D9488]/20"
                            >
                                <ShieldCheck className="w-5 h-5 mr-2" />
                                Run Compliance Check
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    // Checking Step (loading)
    if (step === 'checking') {
        return (
            <div className="p-6 md:p-8 max-w-7xl mx-auto">
                <div className="max-w-2xl mx-auto text-center py-24 space-y-6">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0D9488]/10 mb-4">
                        <Loader2 className="w-10 h-10 text-[#0D9488] animate-spin" />
                    </div>
                    <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Analyzing Compliance</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Checking your activation plan against Virginia ABC regulations...
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                        <ShieldCheck className="w-3 h-3" />
                        Powered by AI Compliance Agent
                    </div>
                </div>
            </div>
        )
    }

    // Results Step
    const statusConfig = {
        compliant: {
            icon: CheckCircle2,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50 border-emerald-200',
            label: 'Compliant',
            description: 'This activation plan complies with Virginia ABC regulations.',
        },
        conditional: {
            icon: AlertTriangle,
            color: 'text-amber-600',
            bg: 'bg-amber-50 border-amber-200',
            label: 'Conditional',
            description: 'This activation can proceed with the following conditions.',
        },
        blocked: {
            icon: XCircle,
            color: 'text-red-600',
            bg: 'bg-red-50 border-red-200',
            label: 'Blocked',
            description: 'This activation plan has compliance issues that must be resolved.',
        },
    }

    const config = complianceResult ? statusConfig[complianceResult.compliance_status] : statusConfig.compliant
    const StatusIcon = config.icon

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <Button variant="ghost" className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 mb-4" onClick={() => setStep('form')}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Form
                </Button>
                <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Compliance Results</h1>
                <p className="text-slate-500 text-sm mt-1">Review the compliance analysis for your activation plan.</p>
            </div>

            <div className="max-w-3xl space-y-6">
                {/* AI Badge */}
                {complianceResult && !complianceResult.ai_powered && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
                        <Info className="w-4 h-4 flex-shrink-0" />
                        AI agent unavailable -- using basic rule matching. Set ANTHROPIC_API_KEY for comprehensive analysis.
                    </div>
                )}

                {/* Status Card */}
                <Card className={`border ${config.bg} rounded-xl`}>
                    <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${config.bg}`}>
                                <StatusIcon className={`w-6 h-6 ${config.color}`} />
                            </div>
                            <div>
                                <h3 className={`text-lg font-semibold ${config.color}`}>{config.label}</h3>
                                <p className="text-slate-600 text-sm mt-1">{config.description}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Reasoning */}
                {complianceResult && complianceResult.reasoning.length > 0 && (
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900">Analysis</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {complianceResult.reasoning.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                        <span className="text-slate-400 mt-1">-</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Required Permits */}
                {complianceResult && complianceResult.required_permits.length > 0 && (
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900">Required Permits</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {complianceResult.required_permits.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                        <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Required Forms */}
                {complianceResult && complianceResult.required_forms && complianceResult.required_forms.length > 0 && (
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900">Required Forms</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {complianceResult.required_forms.map((form, i) => (
                                    <li key={i} className="flex items-center gap-2 text-sm">
                                        <a
                                            href={form.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#0D9488] hover:underline font-medium"
                                        >
                                            {form.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Suggested Checklist */}
                {complianceResult && complianceResult.suggested_checklist.length > 0 && (
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900">Compliance Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {complianceResult.suggested_checklist.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                        <div className="w-5 h-5 rounded border border-slate-300 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Legal Alternatives (if blocked) */}
                {complianceResult && complianceResult.legal_alternatives && complianceResult.legal_alternatives.length > 0 && (
                    <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-slate-900">Legal Alternatives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {complianceResult.legal_alternatives.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                    <Button variant="outline" onClick={() => setStep('form')} className="flex-1 h-12 border-slate-200 text-slate-700">
                        Edit Activation
                    </Button>
                    <Button
                        onClick={handleSaveActivation}
                        disabled={saving}
                        className="flex-[2] h-12 bg-[#0D9488] hover:bg-[#0D9488]/90 text-white font-semibold shadow-lg shadow-[#0D9488]/20"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                Save & Continue
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
