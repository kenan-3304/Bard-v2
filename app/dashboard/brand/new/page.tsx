
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Loader2, CheckCircle2, AlertTriangle, XCircle, ExternalLink, CheckSquare, ArrowRight } from 'lucide-react'

export default function NewActivation() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [view, setView] = useState<'form' | 'analyzing' | 'results'>('form')
    const [status, setStatus] = useState<'compliant' | 'conditional' | 'blocked'>('compliant')

    const [formData, setFormData] = useState({
        title: '',
        type: '',
        venue: '',
        city: 'Charlottesville', // Default or empty, user input
        description: '',
        start_date: '',
    })

    const isFormValid = formData.title && formData.type && formData.venue && formData.start_date

    const handleComplianceCheck = async () => {
        setView('analyzing')

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 2500))

        const desc = formData.description.toLowerCase()
        const blockedPhrases = ["bar tab", "open bar", "free drinks", "pay the bar", "reimburse"]

        if (blockedPhrases.some(phrase => desc.includes(phrase))) {
            setStatus('blocked')
        } else if (formData.type === 'Sponsored Event') {
            setStatus('conditional')
        } else {
            setStatus('compliant')
        }

        setView('results')
    }

    if (view === 'analyzing') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#0D9488]/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-16 h-16 text-[#0D9488] animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Agent analyzing activation against Virginia ABC regulations...</h2>
                <p className="text-slate-500 max-w-md">Checking for prohibited practices, required permits, and sponsorship limits.</p>
            </div>
        )
    }

    if (view === 'results') {
        return (
            <div className="max-w-4xl mx-auto py-8 px-6">
                <div className="mb-8">
                    <Button variant="ghost" onClick={() => setView('form')} className="pl-0 hover:bg-transparent hover:text-primary">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Edit
                    </Button>
                </div>

                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Check Results</h1>
                        <p className="text-slate-500 font-medium">{formData.title}</p>
                    </div>

                    {/* Status Badge */}
                    <Card className={`border-l-4 shadow-md ${status === 'compliant' ? 'border-l-emerald-500 bg-emerald-50/50' :
                        status === 'conditional' ? 'border-l-amber-500 bg-amber-50/50' :
                            'border-l-red-500 bg-red-50/50'
                        }`}>
                        <CardContent className="pt-6 flex items-start gap-4">
                            {status === 'compliant' && <CheckCircle2 className="w-8 h-8 text-emerald-600 mt-1 flex-shrink-0" />}
                            {status === 'conditional' && <AlertTriangle className="w-8 h-8 text-amber-600 mt-1 flex-shrink-0" />}
                            {status === 'blocked' && <XCircle className="w-8 h-8 text-red-600 mt-1 flex-shrink-0" />}

                            <div>
                                <h2 className={`text-xl font-bold mb-1 ${status === 'compliant' ? 'text-emerald-900' :
                                    status === 'conditional' ? 'text-amber-900' :
                                        'text-red-900'
                                    }`}>
                                    {status === 'compliant' && "✅ Compliant — Activation Allowed"}
                                    {status === 'conditional' && "⚠️ Conditional — Requires ABC Filing"}
                                    {status === 'blocked' && "🚫 Blocked — Compliance Violation"}
                                </h2>
                                <p className={`text-sm ${status === 'compliant' ? 'text-emerald-700' :
                                    status === 'conditional' ? 'text-amber-700' :
                                        'text-red-700'
                                    }`}>
                                    {status === 'compliant' && "This activation meets all standard Virginia ABC requirements for brand promotion."}
                                    {status === 'conditional' && "This activation is allowed but requires explicit approval and form submission to VA ABC."}
                                    {status === 'blocked' && "This activation contains elements that violate Virginia ABC prohibitions on tied-house induce."}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Agent Reasoning */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-[#0D9488] rounded-full inline-block"></span>
                                Agent Reasoning
                            </h3>
                            <ul className="space-y-3 pl-2">
                                {status === 'compliant' && (
                                    <>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            Activation type "{formData.type}" flows through standard solicitor privileges.
                                        </li>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-emerald-500 font-bold">•</span>
                                            No prohibited financial inducements detected in description.
                                        </li>
                                    </>
                                )}
                                {status === 'conditional' && (
                                    <>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-amber-500 font-bold">•</span>
                                            "Sponsored Event" requires advance notice and sponsorship limitation checks.
                                        </li>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-amber-500 font-bold">•</span>
                                            Must verify that value provided does not exceed statutory caps per licensee.
                                        </li>
                                    </>
                                )}
                                {status === 'blocked' && (
                                    <>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-red-500 font-bold">•</span>
                                            Description contains prohibited terms implying financial contribution to retailer.
                                        </li>
                                        <li className="flex gap-3 text-sm text-slate-600">
                                            <span className="text-red-500 font-bold">•</span>
                                            Direct reimbursement or "bar tabs" are strictly forbidden under Tied House laws.
                                        </li>
                                    </>
                                )}
                            </ul>
                        </div>

                        {/* Required Forms */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-slate-200 rounded-full inline-block"></span>
                                Required Forms
                            </h3>
                            <div className="space-y-3">
                                {status === 'blocked' ? (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-500 italic text-sm">
                                        No forms available — activation is not permitted as described.
                                    </div>
                                ) : (
                                    <>
                                        {(formData.type === 'Tasting / Sampling' || status === 'compliant') && (
                                            <a
                                                href="https://www.abc.virginia.gov/library/licenses/pdfs/solicitortasting.pdf"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-[#0D9488] hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 p-2 rounded group-hover:bg-[#0D9488]/10 transition-colors">
                                                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#0D9488]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Solicitor Tasting Permit (Form 805-97)</span>
                                                </div>
                                            </a>
                                        )}
                                        {formData.type === 'Sponsored Event' && (
                                            <a
                                                href="https://www.abc.virginia.gov/licenses/spirits-industry-resources/manufacturer-wholesaler-sponsorship-request"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-[#0D9488] hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-slate-100 p-2 rounded group-hover:bg-[#0D9488]/10 transition-colors">
                                                        <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-[#0D9488]" />
                                                    </div>
                                                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Manufacturer/Wholesaler Sponsorship Request</span>
                                                </div>
                                            </a>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Suggested Legal Alternatives (Blocked Only) */}
                    {status === 'blocked' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Suggested Legal Alternatives</h3>
                            <div className="bg-[#0D9488]/5 border border-[#0D9488]/20 rounded-xl p-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700"><strong>Convert to a licensed tasting event</strong> — brand ambassador conducts samples under a Solicitor Tasting Permit (Form 805-97)</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700"><strong>Structure as a sponsored cultural or sporting event</strong> with proper ABC filing</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-[#0D9488] mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-slate-700"><strong>Limit brand involvement to POS signage</strong> and branded materials within VA ABC value limits ($215)</span>
                                </div>
                            </div>
                            <Button
                                onClick={() => setView('form')}
                                variant="outline"
                                className="w-full h-12 text-lg border-[#0D9488] text-[#0D9488] hover:bg-[#0D9488]/10"
                            >
                                <ChevronLeft className="w-5 h-5 mr-2" />
                                Revise Activation
                            </Button>
                        </div>
                    )}

                    <div className="my-8 h-px bg-slate-200"></div>

                    {/* Checklist */}
                    {status !== 'blocked' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-slate-900">Compliance Checklist</h3>
                            <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
                                <div className="flex items-start gap-3">
                                    <CheckSquare className="w-5 h-5 text-[#0D9488] mt-0.5" />
                                    <span className="text-sm text-slate-700">Solicitor Tasting Permit obtained / active</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckSquare className="w-5 h-5 text-[#0D9488] mt-0.5" />
                                    <span className="text-sm text-slate-700">Tasting limited to licensed premises areas only</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckSquare className="w-5 h-5 text-[#0D9488] mt-0.5" />
                                    <span className="text-sm text-slate-700">No more than 6 oz wine / 2 oz spirits per person per day</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckSquare className="w-5 h-5 text-[#0D9488] mt-0.5" />
                                    <span className="text-sm text-slate-700">Brand ambassador present on-site at all times</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <CheckSquare className="w-5 h-5 text-[#0D9488] mt-0.5" />
                                    <span className="text-sm text-slate-700">Signage within VA ABC value limits ($215 per brand)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {status !== 'blocked' && (
                        <div className="pt-4">
                            <Button
                                onClick={() => {
                                    const params = new URLSearchParams({
                                        title: formData.title,
                                        type: formData.type,
                                        venue: formData.venue,
                                        date: formData.start_date,
                                        city: formData.city
                                    })
                                    router.push(`/dashboard/brand/activation-setup?${params.toString()}`)
                                }}
                                className="w-full h-12 text-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-lg shadow-teal-900/10"
                            >
                                Continue to Activation Setup <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-[1600px] mx-auto py-8 px-6">
            <div className="mb-8">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>

            <div className="max-w-3xl mx-auto">
                {/* The Builder Form */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Activation</h1>
                        <p className="text-slate-500">Describe your activation and the compliance agent will evaluate it.</p>
                    </div>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                            <CardTitle className="text-xl font-bold text-slate-900">Activation Details</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 space-y-8">

                            {/* Title */}
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-slate-700 font-semibold">Activation Name</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Tito's Summer Tasting at The Whiskey Jar"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="h-12 text-lg"
                                />
                            </div>

                            {/* Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type" className="text-slate-700 font-semibold">Activation Type</Label>
                                <Select onValueChange={(value) => setFormData({ ...formData, type: value })}>
                                    <SelectTrigger className="h-12">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Tasting / Sampling">Tasting / Sampling</SelectItem>
                                        <SelectItem value="Sponsored Event">Sponsored Event</SelectItem>
                                        <SelectItem value="Ambassador Visit">Ambassador Visit</SelectItem>
                                        <SelectItem value="Brand Promotion / Other">Brand Promotion / Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Venue & City */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="venue" className="text-slate-700 font-semibold">Venue Name</Label>
                                    <Input
                                        id="venue"
                                        placeholder="e.g. The Whiskey Jar"
                                        value={formData.venue}
                                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                                        className="h-12"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-slate-700 font-semibold">Venue City</Label>
                                    <div className="flex items-center gap-3">
                                        <Input
                                            id="city"
                                            placeholder="City"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="h-12"
                                        />
                                        <span className="font-semibold text-slate-500 whitespace-nowrap">Virginia</span>
                                    </div>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <Label htmlFor="start_date" className="text-slate-700 font-semibold">Proposed Date</Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={formData.start_date}
                                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                                    className="h-12"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-slate-700 font-semibold">Description</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Briefly describe what will happen — who will be there, what the brand is providing, how alcohol is involved."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="resize-none text-base"
                                />
                            </div>

                        </CardContent>
                        <div className="p-6 bg-slate-50 border-t border-slate-200 rounded-b-xl">
                            <Button
                                disabled={!isFormValid || loading}
                                onClick={handleComplianceCheck}
                                className="w-full h-12 text-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-lg shadow-teal-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Checking...' : '⚡ Run Compliance Check'}
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
