
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
            <aside className="w-64 border-r border-slate-200 bg-slate-50 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center text-white font-bold">D</div>
                        <span className="font-bold text-lg tracking-tight text-zinc-900">Deal OS</span>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform</p>

                    {role === 'brand' && (
                        <>
                            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-zinc-900 hover:bg-slate-200" asChild>
                                <Link href="/dashboard/brand">
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Brand Dashboard
                                </Link>
                            </Button>
                            <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-zinc-900 hover:bg-slate-200" asChild>
                                <Link href="/dashboard/brand/bars">
                                    <FileText className="w-4 h-4 mr-2" />
                                    Partner Network
                                </Link>
                            </Button>
                        </>
                    )}

                    {role === 'bar' && (
                        <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-zinc-900 hover:bg-slate-200" asChild>
                            <Link href="/dashboard/bar">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Bar Dashboard
                            </Link>
                        </Button>
                    )}

                    {/* 
                    <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-6">Settings</p>
                    <Button variant="ghost" className="w-full justify-start text-slate-600 hover:text-zinc-900 hover:bg-slate-200">
                        <Settings className="w-4 h-4 mr-2" />
                        Profile
                    </Button> 
                    */}
                </nav>

                <div className="p-4 border-t border-slate-200">
                    <SignOutButton className="w-full justify-start" variant="ghost" />
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-white">
                {/* Mobile Header (optional implementation) typically goes here */}

                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
