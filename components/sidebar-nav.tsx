'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, PlusCircle, MapPin, Users, History, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    LayoutDashboard,
    PlusCircle,
    MapPin,
    Users,
    History,
    ClipboardCheck,
    ShieldCheck,
}

interface SidebarNavProps {
    links: { href: string; label: string; icon: string }[]
}

export function SidebarNav({ links }: SidebarNavProps) {
    const pathname = usePathname()

    return (
        <>
            {links.map((link) => {
                const Icon = iconMap[link.icon] || LayoutDashboard
                const isActive = pathname === link.href || (link.href !== '/dashboard/brand' && link.href !== '/dashboard/agency' && pathname.startsWith(link.href))

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                            isActive
                                ? 'bg-[#0D9488]/10 text-[#0D9488]'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        {link.label}
                    </Link>
                )
            })}
        </>
    )
}
