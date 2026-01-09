import { createClient } from '@/lib/supabase'
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

            <div className="grid gap-4">
                {campaigns?.map((campaign: any) => (
                    <Card key={campaign.id} className="hover:shadow-md transition-shadow border-slate-200">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xl font-bold text-slate-900">
                                {campaign.title}
                            </CardTitle>
                            <StatusBadge status={campaign.status} />
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-500 mb-4">{campaign.description}</p>
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-slate-700">Budget: ${campaign.total_budget}</span>
                                <Link href={`/dashboard/brand/campaign/${campaign.id}`} className="text-blue-600 hover:underline font-medium">
                                    Manage Offers &rarr;
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {campaigns?.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No campaigns yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    )
}
