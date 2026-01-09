'use client'

import { Button } from '@/components/ui/button'
import { signOut } from '@/app/auth/signout/action'

interface SignOutButtonProps {
    className?: string
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

export function SignOutButton({ className, variant = "outline" }: SignOutButtonProps) {
    return (
        <Button
            variant={variant}
            onClick={() => signOut()}
            className={className}
        >
            Sign Out
        </Button>
    )
}