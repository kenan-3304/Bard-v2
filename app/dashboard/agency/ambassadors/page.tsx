
import { createClient } from '@/lib/supabase-server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Mail, Phone, ShieldCheck, ChevronRight } from 'lucide-react'
import { BackButton } from '@/components/ui/back-button'

export const dynamic = 'force-dynamic'

export default async function AgencyAmbassadors() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Mock data for prototype
    const mockAmbassadors = [
        { id: 1, name: 'Sarah Jenkins', role: 'Lead Ambassador', email: 'sarah@example.com', phone: '555-0101', status: 'active', permitStatus: 'valid' },
        { id: 2, name: 'Mike Ross', role: 'Ambassador', email: 'mike@example.com', phone: '555-0102', status: 'active', permitStatus: 'expiring' },
        { id: 3, name: 'Jessica Pearson', role: 'Senior Ambassador', email: 'jessica@example.com', phone: '555-0103', status: 'inactive', permitStatus: 'expired' },
    ]

    return (
        <div className="p-8 h-full flex flex-col space-y-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <BackButton />

            <header className="flex items-end justify-between border-b border-white/5 pb-6">
                <div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white">Ambassador Roster</h1>
                    <p className="text-slate-400 mt-2 font-light">Manage your team and their compliance status.</p>
                </div>
                <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-[0_0_15px_rgba(234,88,12,0.3)] hover:shadow-[0_0_25px_rgba(234,88,12,0.5)] transition-all">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ambassador
                </Button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {mockAmbassadors.map((ambassador) => (
                    <Card key={ambassador.id} className="bg-slate-900/40 border-white/5 hover:border-orange-500/30 hover:bg-slate-900/60 transition-all duration-300 group backdrop-blur-md">
                        <CardHeader className="pb-4 relative">
                            {ambassador.status === 'active' && (
                                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            )}
                            <div className="flex items-center gap-4">
                                <Avatar className="h-14 w-14 border-2 border-white/10 group-hover:border-orange-500/50 transition-colors shadow-lg">
                                    <AvatarFallback className="bg-slate-800 text-slate-200 text-lg">{ambassador.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="text-lg font-bold text-slate-100 group-hover:text-white">{ambassador.name}</CardTitle>
                                    <p className="text-sm text-slate-400">{ambassador.role}</p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                                    <div className="p-1.5 rounded-md bg-white/5">
                                        <Mail className="w-3.5 h-3.5" />
                                    </div>
                                    {ambassador.email}
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 group-hover:text-slate-300 transition-colors">
                                    <div className="p-1.5 rounded-md bg-white/5">
                                        <Phone className="w-3.5 h-3.5" />
                                    </div>
                                    {ambassador.phone}
                                </div>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2 text-slate-500 font-medium uppercase tracking-wider">
                                    <ShieldCheck className="w-4 h-4" />
                                    Permit
                                </div>
                                <div>
                                    {ambassador.permitStatus === 'valid' && <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.2)]">Valid</Badge>}
                                    {ambassador.permitStatus === 'expiring' && <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_8px_rgba(249,115,22,0.2)]">Expiring</Badge>}
                                    {ambassador.permitStatus === 'expired' && <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.2)]">Expired</Badge>}
                                </div>
                            </div>

                            <Button variant="ghost" className="w-full justify-between hover:bg-white/5 hover:text-white text-slate-400 group/btn">
                                View Profile
                                <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
