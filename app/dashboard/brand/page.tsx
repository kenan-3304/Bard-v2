import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, TrendingUp, AlertCircle, Users } from 'lucide-react'
import { StatusBadge } from '@/components/status-badge'

export default async function BrandDashboard() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Get Brand
    const { data: brand } = await supabase
        .from('brands')
        .select('id, name')
        .eq('owner_id', user?.id)
        .single()

    // Get Campaigns (Fix for multiple rows)
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', brand?.id)
        .order('created_at', { ascending: false })

    const activeSpend = campaigns ? campaigns.reduce((acc: number, c: any) => acc + (c.status === 'active' ? c.total_budget : 0), 0) : 0
    const activeCampaigns = campaigns ? campaigns.filter((c: any) => c.status === 'active').length : 0
    const pendingActions = 3 // Mock number for prototype

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Command Center</h1>
                    <p className="text-slate-500">Monitor your active campaigns and performance.</p>
                </div>
                <Link href="/dashboard/brand/new">
                    <Button className="bg-zinc-900 hover:bg-black text-white px-6">
                        + New Campaign
                    </Button>
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Spend</CardTitle>
                        <span className="text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">${activeSpend.toLocaleString()}</div>
                        <p className="text-xs text-slate-500 mt-1">Allocated across {activeCampaigns} live campaigns</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Actions</CardTitle>
                        <span className="text-amber-500">
                            <AlertCircle className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">{pendingActions}</div>
                        <p className="text-xs text-slate-500 mt-1">Offers and proofs requiring review</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Est. Network Reach</CardTitle>
                        <span className="text-blue-500">
                            <Users className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">14.2k</div>
                        <p className="text-xs text-slate-500 mt-1">Monthly impressions available</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-1/3">Campaign</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Status</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Budget</th>
                                <th className="px-6 py-4 font-semibold text-slate-900 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {campaigns?.map((campaign: any) => (
                                <tr key={campaign.id} className="group hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5">
                                        <div className="font-semibold text-slate-900 text-base mb-1">{campaign.title}</div>
                                        <div className="text-slate-500 line-clamp-1 max-w-sm">{campaign.description}</div>
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        <StatusBadge status={campaign.status} />
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Total Budget</span>
                                            <span className="text-xl font-bold text-slate-900 font-mono tracking-tight">
                                                ${campaign.total_budget?.toLocaleString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right align-middle">
                                        <Button asChild variant="outline" size="sm" className="font-medium text-slate-700 hover:text-slate-900 hover:border-slate-300">
                                            <Link href={`/dashboard/brand/campaign/${campaign.id}`}>
                                                Manage Offers
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {campaigns?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                        No campaigns found. Create your first campaign to get started.
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
