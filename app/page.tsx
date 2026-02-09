
import { createClient } from '@/lib/supabase-server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Building2, Users } from 'lucide-react'
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
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#134E4A] bg-[length:400%_400%] animate-gradient">
        <div className="text-center space-y-6 max-w-2xl relative">
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-teal-500/20 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col items-center">

            <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl text-white mb-2">
              Welcome to Proof
            </h1>
            <p className="text-xl text-[#94A3B8]">
              Your AI compliance agent for alcohol activations.
            </p>
          </div>
          <div className="flex justify-center gap-4 pt-4">
            <Button asChild size="lg" className="bg-[#0D9488] hover:bg-[#0D9488]/90 text-white text-lg px-8 py-6 rounded-xl shadow-[0_0_20px_rgba(13,148,136,0.3)] hover:shadow-[0_0_30px_rgba(13,148,136,0.5)] transition-all duration-300">
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
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-[#0F172A] to-[#1E293B]">
          <Card className="w-full max-w-md text-center bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-white">Welcome back, Alcohol Brand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full h-12 text-lg font-semibold bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-lg shadow-teal-900/20">
                <Link href="/dashboard/brand">Go to Dashboard</Link>
              </Button>
              <SignOutButton className="w-full h-12 text-lg text-white border-white/20 bg-transparent hover:bg-white/10 hover:text-white" variant="outline" />
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
            How do you use Proof?
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Select your role to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
          {/* Brand Card */}
          <Link href="/onboard/brand" className="group">
            <div className="relative h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-200 hover:border-[#0D9488] transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="w-12 h-12 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0D9488] transition-colors duration-300">
                    <Building2 className="w-6 h-6 text-[#0D9488] group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Alcohol Brand</h2>
                  <p className="text-lg font-medium text-[#0D9488] mb-4">
                    Plan bar activations, enforce ABC compliance, and generate audit-ready packets.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-[#0D9488] group-hover:translate-x-1 transition-transform">
                  Continue as Brand <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>

          {/* Agency Card */}
          <Link href="/onboard/agency" className="group">
            <div className="relative h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-gray-200 hover:border-[#0D9488] transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex flex-col h-full justify-between space-y-6">
                <div>
                  <div className="w-12 h-12 bg-[#0D9488]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0D9488] transition-colors duration-300">
                    <Users className="w-6 h-6 text-[#0D9488] group-hover:text-white transition-colors" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Agency / Field Marketing</h2>
                  <p className="text-lg font-medium text-[#0D9488] mb-4">
                    Manage compliant activations on behalf of your alcohol brand clients.
                  </p>
                </div>
                <div className="pt-4 flex items-center text-sm font-semibold text-[#0D9488] group-hover:translate-x-1 transition-transform">
                  Continue as Agency <span className="ml-2">→</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  )
}
