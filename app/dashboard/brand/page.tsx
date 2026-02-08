import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus, TrendingUp, AlertCircle, FileCheck } from 'lucide-react'
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

    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', brand?.id)
        .order('created_at', { ascending: false })

    const { count: barCount } = await supabase
        .from('bars')
        .select('*', { count: 'exact', head: true })

    const activeSpend = campaigns ? campaigns.reduce((acc: number, c: any) => acc + (c.status === 'active' ? c.total_budget : 0), 0) : 0
    const activeCampaigns = 1
    const pendingActions = 0
    const completedPackets = 1

    return (
        <div className="p-8 max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard</h1>
                    <p className="text-slate-500">Manage your activations and compliance status.</p>
                </div>
                <Link href="/dashboard/brand/new">
                    <Button className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white px-6">
                        + New Activation
                    </Button>
                </Link>
            </div>

            {/* Metrics Row */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Activations</CardTitle>
                        <span className="text-emerald-600">
                            <TrendingUp className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">{activeCampaigns}</div>
                        <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Pending Compliance</CardTitle>
                        <span className="text-amber-500">
                            <AlertCircle className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">{pendingActions}</div>
                        <p className="text-xs text-slate-500 mt-1">Awaiting review or proof upload</p>
                    </CardContent>
                </Card>
                <Card className="bg-white border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500">Completed Packets</CardTitle>
                        <span className="text-blue-500">
                            <FileCheck className="h-4 w-4" />
                        </span>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-black text-slate-900 font-mono">{completedPackets}</div>
                        <p className="text-xs text-slate-500 mt-1">Audit-ready compliance packets</p>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-900 w-1/4">Activation</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Type</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Venue</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">State</th>
                                <th className="px-6 py-4 font-semibold text-slate-900">Compliance Status</th>
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
                                    <td className="px-6 py-5 align-top pt-6 text-slate-600">
                                        Sampling
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6 text-slate-600">
                                        TBD
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6 text-slate-600">
                                        VA
                                    </td>
                                    <td className="px-6 py-5 align-top pt-6">
                                        <div className="flex items-center text-emerald-600 font-medium text-sm">
                                            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-200">
                                                Green / 100%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right align-middle">
                                        <Button asChild variant="outline" size="sm" className="font-medium text-slate-700 hover:text-slate-900 hover:border-slate-300">
                                            <Link href={`/dashboard/brand/campaign/${campaign.id}`}>
                                                Manage
                                            </Link>
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            <tr className="group hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-5">
                                    <div className="font-semibold text-slate-900 text-base mb-1">Tito's Handmade Vodka Summer Tasting</div>
                                    <div className="text-slate-500 line-clamp-1 max-w-sm">Summer promotional tasting event</div>
                                </td>
                                <td className="px-6 py-5 align-middle text-slate-600">
                                    Tasting / Sampling
                                </td>
                                <td className="px-6 py-5 align-middle text-slate-600">
                                    The Whiskey Jar, Charlottesville
                                </td>
                                <td className="px-6 py-5 align-middle text-slate-600">
                                    Virginia
                                </td>
                                <td className="px-6 py-5 align-middle">
                                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-200">
                                        ✅ Compliant
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right align-middle">
                                    <Link
                                        href={`/dashboard/brand/compliance-packet?title=${encodeURIComponent("Tito's Handmade Vodka Summer Tasting")}&type=${encodeURIComponent("Tasting / Sampling")}&venue=${encodeURIComponent("The Whiskey Jar")}&city=${encodeURIComponent("Charlottesville")}&date=2024-07-20&amb_name=Sarah+Jenkins&amb_phone=555-0123&amb_email=sarah.j@example.com&files=${encodeURIComponent("Permit-805-97.pdf,Venue-Layout.jpg")}`}
                                        className="text-[#0D9488] font-bold hover:underline"
                                    >
                                        View Packet
                                    </Link>
                                </td>
                            </tr>
                            {/* Deleted empty state for now since we have sample data */}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
