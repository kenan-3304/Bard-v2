
import Link from 'next/link'
import { LayoutDashboard, Settings, LogOut, PlusCircle, FileText } from 'lucide-react'
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
        <div className="min-h-screen bg-white flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 flex-shrink-0 flex flex-col transition-all duration-300 ease-in-out">
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-900/20 group-hover:bg-indigo-500 transition-colors">D</div>
                        <span className="font-semibold text-lg tracking-tight text-white group-hover:text-slate-100 transition-colors">Deal OS</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">Platform</p>

                    {role === 'brand' && (
                        <>
                            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/brand">
                                    <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                                    Brand Dashboard
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all font-medium h-9" asChild>
                                <Link href="/dashboard/brand/bars">
                                    <FileText className="w-4 h-4 mr-3 opacity-70" />
                                    Partner Network
                                </Link>
                            </Button>
                        </>
                    )}

                    {role === 'bar' && (
                        <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-white/5 active:bg-white/10 transition-all font-medium h-9" asChild>
                            <Link href="/dashboard/bar">
                                <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" />
                                Bar Dashboard
                            </Link>
                        </Button>
                    )}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 px-3 py-2 text-sm text-slate-400">
                        <SignOutButton className="w-full justify-start hover:text-white hover:bg-white/5" variant="ghost" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-slate-50">
                {/* Mobile Header (optional implementation) typically goes here */}

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
