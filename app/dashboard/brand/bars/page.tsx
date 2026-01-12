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
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Partner Network</h1>
                <p className="text-sm text-slate-500 max-w-2xl">
                    Discover and connect with premium venues for your next activation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bars?.map((bar: any) => (
                    <Card key={bar.id} className="group hover:shadow-lg transition-all duration-300 border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 aspect-video w-full relative">
                            {bar.image_url ? (
                                <img
                                    src={bar.image_url}
                                    alt={bar.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                /* Placeholder for bar image */
                                <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                                    <MapPin className="w-8 h-8 opacity-20" />
                                </div>
                            )}
                        </div>
                        <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-indigo-600 transition-colors">
                                        {bar.name}
                                    </h3>
                                    <div className="flex items-center text-xs text-slate-500 mt-1 truncate">
                                        <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                                        {bar.location}
                                    </div>
                                </div>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 flex-shrink-0 text-[10px] uppercase tracking-wider font-semibold border border-slate-200">
                                    Partner
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-2">
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 border-dashed">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                                        Capacity
                                    </span>
                                    <span className="font-semibold text-slate-900">{bar.capacity || 'N/A'}</span>
                                </div>

                                {bar.peak_nights && bar.peak_nights.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center">
                                            Peak Nights
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {bar.peak_nights.map((night: string) => (
                                                <span key={night} className="inline-flex items-center px-2 py-1 rounded bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-medium uppercase tracking-wide">
                                                    {night}
                                                </span>
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
