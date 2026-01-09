
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'
import { Plus } from 'lucide-react'

export default async function BrandDashboard() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please login</div>

    // Get Brand ID for this user
    const { data: brand } = await supabase
        .from('brands')
        .select('id')
        .eq('owner_id', user.id)
        .single()

    if (!brand) return <div>No Brand Profile found.</div>

    // Fetch Campaigns
    const { data: campaigns } = await supabase
        .from('campaigns')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Brand Dashboard</h1>
                    <p className="text-muted-foreground">Manage your campaigns</p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/brand/new">
                        <Plus className="w-4 h-4 mr-2" />
                        New Campaign
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4">
                {campaigns?.map((campaign) => (
                    <Card key={campaign.id}>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>{campaign.title}</CardTitle>
                                    <CardDescription>Budget: ${campaign.total_budget}</CardDescription>
                                </div>
                                <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium uppercase">
                                    {campaign.status}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-gray-500 mb-4">{campaign.description || 'No description'}</p>
                            <div className="flex justify-between items-end">
                                <p className="text-xs text-gray-400">
                                    {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
                                </p>
                                <Button variant="secondary" size="sm" asChild>
                                    <Link href={`/dashboard/brand/campaign/${campaign.id}`}>Manage Offers</Link>
                                </Button>
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
