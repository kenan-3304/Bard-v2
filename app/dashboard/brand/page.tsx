import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, TrendingUp, AlertCircle, MapPin, ShieldCheck } from 'lucide-react'

export default async function BrandDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: brand } = await supabase
        .from('brands')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single()

    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', brand?.id)
        .order('created_at', { ascending: false })

    const { count: venueCount } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })

    const activeCampaigns = campaigns ? campaigns.filter((c: any) => c.status === 'active').length : 0
    const pendingCompliance = campaigns ? campaigns.filter((c: any) => c.compliance_status === 'pending' || !c.compliance_status).length : 0
    const completedPackets = campaigns ? campaigns.filter((c: any) => c.status === 'completed').length : 0

    const getComplianceBadge = (status: string | null) => {
        switch (status) {
            case 'compliant':
                return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">Compliant</span>
            case 'conditional':
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">Conditional</span>
            case 'blocked':
                return <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-red-200">Blocked</span>
            default:
                return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">Pending</span>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">Active</span>
            case 'draft':
                return <span className="bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">Draft</span>
            case 'completed':
                return <span className="bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-blue-200">Completed</span>
            case 'paused':
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">Paused</span>
            default:
                return <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-200">{status}</span>
        }
    }

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Activations</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your brand activations and compliance status.</p>
                </div>
                <Link href="/dashboard/brand/new">
                    <Button className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6">
                        <Plus className="w-4 h-4 mr-2" />
                        New Activation
                    </Button>
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Activations</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{activeCampaigns}</div>
                        <p className="text-xs text-slate-500 mt-1">Currently running</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Compliance</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{pendingCompliance}</div>
                        <p className="text-xs text-slate-500 mt-1">Awaiting compliance check</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Venue Network</CardTitle>
                        <MapPin className="h-4 w-4 text-[#0D9488]" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{venueCount || 0}</div>
                        <p className="text-xs text-slate-500 mt-1">Available venues</p>
                    </CardContent>
                </Card>
            </div>

            {/* Activations Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-1/3">Activation</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Compliance</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns?.map((campaign: any) => (
                                <tr key={campaign.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-slate-900 mb-1">{campaign.title}</div>
                                        <div className="text-slate-500 text-xs line-clamp-1 max-w-sm">{campaign.description}</div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded capitalize">
                                            {campaign.activation_type?.replace('_', ' ') || 'tasting'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5">
                                        {getStatusBadge(campaign.status)}
                                    </td>
                                    <td className="px-6 py-5">
                                        {getComplianceBadge(campaign.compliance_status)}
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <Button asChild variant="outline" size="sm" className="bg-white hover:bg-slate-50 font-medium text-slate-700 hover:text-slate-900 border-slate-200 hover:border-slate-300">
                                            <Link href={`/dashboard/brand/activation/${campaign.id}`}>
                                                View Details
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {(!campaigns || campaigns.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No activations yet. Create your first activation to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
