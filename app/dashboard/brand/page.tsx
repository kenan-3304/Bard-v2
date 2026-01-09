import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-1">Brand Dashboard</h1>
                    <p className="text-slate-500">Manage your campaigns and offers.</p>
                </div>
                <Button asChild className="bg-zinc-900 text-white hover:bg-zinc-800">
                    <Link href="/dashboard/brand/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                    </Link>
                </Button>
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
