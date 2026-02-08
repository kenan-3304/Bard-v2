
import Link from 'next/link'
import { LayoutDashboard, Settings, LogOut, PlusCircle, FileText, Megaphone, History as HistoryIcon, ShieldCheck, Users } from 'lucide-react'
import { Toaster } from 'sonner'
import { SignOutButton } from '@/components/sign-out-button'
import { Button } from '@/components/ui/button'

import { createClient } from '@/lib/supabase-server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Get user role
    let role = null
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
        role = profile?.role
    }
    return (
        <div className="h-screen overflow-hidden bg-background flex">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out border-r border-sidebar-border">
                <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center text-sidebar-primary-foreground font-bold shadow-lg shadow-sidebar-primary/20 group-hover:bg-sidebar-primary/90 transition-colors">D</div>
                        <span className="font-semibold text-lg tracking-tight text-sidebar-foreground group-hover:text-sidebar-foreground/80 transition-colors">Deal OS</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Platform</p>

                    {role === 'brand' && (
                        <>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/brand">
                                    <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                                    Brand Dashboard
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/brand/bars">
                                    <FileText className="w-4 h-4 mr-3 opacity-70" />
                                    Partner Network
                                </Link>
                            </Button>
                        </>
                    )}

                    {role === 'agency' && (
                        <>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/agency">
                                    <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                                    Live Activations
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/agency/vault">
                                    <ShieldCheck className="w-4 h-4 mr-3 opacity-70" />
                                    The Vault
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/agency/ambassadors">
                                    <Users className="w-4 h-4 mr-3 opacity-70" />
                                    Ambassador Roster
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent active:bg-sidebar-accent/50 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/agency/financials">
                                    <FileText className="w-4 h-4 mr-3 opacity-70" />
                                    Financials
                                </Link>
                            </Button>
                        </>
                    )}
                </nav>

                <div className="p-4 border-t border-sidebar-border">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-sidebar-foreground/70">
                        <SignOutButton className="w-full justify-start hover:text-sidebar-foreground hover:bg-sidebar-accent" variant="ghost" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background overflow-hidden relative">
                {/* Mobile Header (optional implementation) typically goes here */}

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
                <Toaster />
            </main>
        </div>
    )
}
