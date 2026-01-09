'use client'

import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
    const handleLogin = async () => {
        const supabase = createClient()
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        })
        if (error) {
            console.error('Login error:', error)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
            <Card className="w-full max-w-sm text-center">
                <CardHeader>
                    <CardTitle>Welcome to Deal OS</CardTitle>
                </CardHeader>
                <CardContent>
                    <Button onClick={handleLogin} className="w-full">
                        Sign in with Google
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
