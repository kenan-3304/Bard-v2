
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Store, Zap } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // State 1: Not Authenticated
  if (!user) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            Welcome to Deal OS
          </h1>
          <p className="text-xl text-muted-foreground">
            The operating system for bars and brands to connect and grow.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
        </div>
      </main>
    )
  }

  // State 3: Authenticated with Role
  if (profile?.role) {
    if (profile.role === 'brand') {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Welcome back, {profile.role}!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/dashboard/brand">Go to Brand Dashboard</Link>
              </Button>
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </main>
      )
    } else {
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Welcome back, {profile.role}!</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full mb-2">
                <Link href="/dashboard/bar">Go to Bar Dashboard</Link>
              </Button>
              <SignOutButton className="w-full" />
            </CardContent>
          </Card>
        </main>
      )
    }
  }

  // State 2: Authenticated without Role (Selection)
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-white md:bg-gray-50/50">
      <div className="absolute top-6 right-6">
        <SignOutButton />
      </div>

      <div className="w-full max-w-5xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
            Start your first activation
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Choose how you participate in college nightlife deals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Bar Card */}
          <Link href="/onboard/bar" className="group">
            <div className="relative h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-200 hover:border-blue-600 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-300">
                    <Store className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">I run a Bar</h2>
                  <p className="text-lg font-medium text-blue-600 mb-4">
                    Receive brand offers. Host activations. Get paid.
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    No fees. No cold pitches. Only vetted campaigns.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
                  Register Venue <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Brand Card */}
          <Link href="/onboard/brand" className="group">
            <div className="relative h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-200 hover:border-amber-500 transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-amber-500 transition-colors duration-300">
                    <Zap className="w-6 h-6 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">I represent a Brand</h2>
                  <p className="text-lg font-medium text-amber-600 mb-4">
                    Launch activations. Reach students. Prove ROI.
                  </p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Target real college bars. Close faster. Get execution proof.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
                  Start Campaign <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
