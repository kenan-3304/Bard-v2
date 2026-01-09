import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Users, Calendar } from 'lucide-react'

export default async function PartnerNetworkPage() {
    const supabase = await createClient()

    // Fetch bars
    const { data: bars } = await supabase
        .from('bars')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="bg-slate-900 text-white p-8 rounded-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Partner Network</h1>
                    <p className="text-slate-300 max-w-xl">
                        Discover and connect with premium venues for your next activation. Browse our curated list of high-traffic bars and restaurants.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-900/50 to-transparent pointer-events-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bars?.map((bar: any) => (
                    <Card key={bar.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                        {bar.name}
                                    </CardTitle>
                                    <div className="flex items-center text-sm text-slate-500 mt-1">
                                        <MapPin className="w-3.5 h-3.5 mr-1" />
                                        {bar.location}
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                                    Partner
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100">
                                    <span className="text-slate-500 flex items-center">
                                        <Users className="w-3.5 h-3.5 mr-2" /> Capacity
                                    </span>
                                    <span className="font-semibold text-slate-900">{bar.capacity || 'N/A'}</span>
                                </div>

                                {bar.peak_nights && bar.peak_nights.length > 0 && (
                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center">
                                            <Calendar className="w-3 h-3 mr-1.5" /> Peak Nights
                                        </span>
                                        <div className="flex flex-wrap gap-2">
                                            {bar.peak_nights.map((night: string) => (
                                                <Badge key={night} variant="outline" className="border-slate-200 text-slate-600 text-xs">
                                                    {night}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {bars?.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                    <p className="text-slate-500">No partners found in the network yet.</p>
                </div>
            )}
        </div>
    )
}
