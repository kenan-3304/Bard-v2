import Link from 'next/link'
import { LayoutDashboard, PlusCircle, MapPin, Users, History, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { Toaster } from 'sonner'
import { SignOutButton } from '@/components/sign-out-button'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase-server'
import { SidebarNav } from '@/components/sidebar-nav'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        role = profile?.role
    }

    const brandLinks = [
        { href: '/dashboard/brand', label: 'Dashboard', icon: 'LayoutDashboard' },
        { href: '/dashboard/brand/new', label: 'New Activation', icon: 'PlusCircle' },
        { href: '/dashboard/brand/venues', label: 'Venue Network', icon: 'MapPin' },
    ]

    const agencyLinks = [
        { href: '/dashboard/agency', label: 'Activations', icon: 'LayoutDashboard' },
        { href: '/dashboard/agency/ambassadors', label: 'Ambassadors', icon: 'Users' },
        { href: '/dashboard/agency/history', label: 'History', icon: 'History' },
    ]

    const links = role === 'brand' ? brandLinks : agencyLinks

    return (
        <div className="h-screen overflow-hidden bg-slate-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col border-r border-slate-800">
                <div className="h-16 flex items-center px-6 border-b border-slate-800">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-[#0D9488]/20 group-hover:bg-[#0D9488]/90 transition-colors">P</div>
                        <span className="font-semibold text-lg tracking-tight text-white group-hover:text-white/80 transition-colors">Proof</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">
                        {role === 'brand' ? 'Brand' : 'Agency'}
                    </p>
                    <SidebarNav links={links} />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
                        <SignOutButton className="w-full justify-start hover:text-white hover:bg-slate-800" variant="ghost" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
                <Toaster />
            </main>
        </div>
    )
}
