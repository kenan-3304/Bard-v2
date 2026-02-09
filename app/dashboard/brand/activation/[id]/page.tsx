'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Calendar, MapPin, FileText, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function ActivationDetail() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [campaign, setCampaign] = useState<any>(null)
    const [venue, setVenue] = useState<any>(null)

    useEffect(() => {
        async function fetchData() {
            const { data: campaignData } = await supabase
                .from('campaigns')
                .select('*')
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

            setLoading(false)
        }
        fetchData()
    }, [id])

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

    const compliance = campaign.compliance_reasoning as any
    const complianceStatus = campaign.compliance_status || 'pending'

    const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
        compliant: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Compliant' },
        conditional: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200', label: 'Conditional' },
        blocked: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Blocked' },
        pending: { icon: ShieldCheck, color: 'text-slate-500', bg: 'bg-slate-50 border-slate-200', label: 'Pending' },
    }

    const config = statusConfig[complianceStatus] || statusConfig.pending
    const StatusIcon = config.icon

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div>
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent text-slate-500 hover:text-slate-900 mb-4">
                    <Link href="/dashboard/brand">
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Back to Dashboard
                    </Link>
                </Button>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">{campaign.title}</h1>
                        <p className="text-slate-500 text-sm mt-1">{campaign.description}</p>
                    </div>
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg}`}>
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                    </div>
                </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <FileText className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Type</p>
                                <p className="text-sm font-semibold text-slate-900 capitalize">{campaign.activation_type?.replace('_', ' ') || 'Tasting'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <MapPin className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue</p>
                                <p className="text-sm font-semibold text-slate-900">{venue?.name || campaign.city || 'TBD'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded-lg">
                                <Calendar className="w-4 h-4 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Date</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {campaign.proposed_date ? new Date(campaign.proposed_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'TBD'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Compliance Analysis */}
            {compliance && (
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-slate-900">Compliance Analysis</h2>

                    {compliance.ai_powered === false && (
                        <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            Basic rule matching was used. Set ANTHROPIC_API_KEY for AI-powered analysis.
                        </p>
                    )}

                    {/* Reasoning */}
                    {compliance.reasoning && compliance.reasoning.length > 0 && (
                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-slate-900">Findings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {compliance.reasoning.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                                            <span className="text-slate-400 mt-1">-</span>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Checklist */}
                    {compliance.suggested_checklist && compliance.suggested_checklist.length > 0 && (
                        <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base font-semibold text-slate-900">Compliance Checklist</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {compliance.suggested_checklist.map((item: string, i: number) => (
                                        <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                            <div className="w-5 h-5 rounded border border-slate-300 flex-shrink-0 mt-0.5" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    )}

                    {/* Required Permits & Forms */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {compliance.required_permits && compliance.required_permits.length > 0 && (
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold text-slate-900">Required Permits</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {compliance.required_permits.map((item: string, i: number) => (
                                            <li key={i} className="flex items-center gap-2 text-sm text-slate-700">
                                                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                        {compliance.required_forms && compliance.required_forms.length > 0 && (
                            <Card className="bg-white border-slate-200 shadow-sm rounded-xl">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base font-semibold text-slate-900">Required Forms</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-2">
                                        {compliance.required_forms.map((form: any, i: number) => (
                                            <li key={i}>
                                                <a href={form.url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#0D9488] hover:underline font-medium">
                                                    {form.name}
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
                {complianceStatus !== 'blocked' && (
                    <Button
                        onClick={() => toast('Compliance packet generation coming soon')}
                        className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-sm"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Generate Compliance Packet
                    </Button>
                )}
                <Button
                    variant="outline"
                    onClick={() => toast('PDF download coming soon')}
                    className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 hover:text-slate-900"
                >
                    <FileText className="w-4 h-4 mr-2" />
                    Download PDF
                </Button>
            </div>
        </div>
    )
}
