'use client'

import { useState, Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, CheckCircle2, CheckSquare, Loader2 } from 'lucide-react'

function ActivationSetupContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Read all params
    const activationTitle = searchParams.get('title') || 'New Activation'
    const type = searchParams.get('type') || ''
    const venue = searchParams.get('venue') || ''
    const date = searchParams.get('date') || ''
    const city = searchParams.get('city') || ''

    const [loading, setLoading] = useState(false)
    const [checklistItems, setChecklistItems] = useState([
        { id: 1, label: "Solicitor Tasting Permit obtained / active", checked: false, file: null as string | null },
        { id: 2, label: "Tasting limited to licensed premises areas only", checked: false, file: null as string | null },
        { id: 3, label: "No more than 6 oz wine / 2 oz spirits per person per day", checked: false, file: null as string | null },
        { id: 4, label: "Brand ambassador present on-site at all times", checked: false, file: null as string | null },
        { id: 5, label: "Signage within VA ABC value limits ($215 per brand)", checked: false, file: null as string | null },
    ])

    const [ambassador, setAmbassador] = useState({ name: '', phone: '', email: '' })
    const [notes, setNotes] = useState('')

    const checkedCount = checklistItems.filter(i => i.checked).length

    const toggleCheck = (id: number) => {
        setChecklistItems(items => items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        ))
    }

    const handleFileUpload = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const fileName = e.target.files[0].name
            setChecklistItems(items => items.map(item =>
                item.id === id ? { ...item, file: fileName, checked: true } : item // Auto-check on upload
            ))
        }
    }

    const removeFile = (id: number) => {
        setChecklistItems(items => items.map(item =>
            item.id === id ? { ...item, file: null } : item
        ))
    }

    const handleGeneratePacket = async () => {
        setLoading(true)

        // Simulate compilation delay
        await new Promise(resolve => setTimeout(resolve, 2500))

        const params = new URLSearchParams({
            title: activationTitle,
            type,
            venue,
            date,
            city,
            amb_name: ambassador.name,
            amb_phone: ambassador.phone,
            amb_email: ambassador.email,
        })

        // Pass list of uploaded files as comma-separated
        const uploadedFiles = checklistItems
            .filter(i => i.file)
            .map(i => i.file)
            .join(',')

        if (uploadedFiles) params.set('files', uploadedFiles)

        router.push(`/dashboard/brand/compliance-packet?${params.toString()}`)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6">
                <div className="relative">
                    <div className="absolute inset-0 bg-[#0D9488]/20 rounded-full blur-xl animate-pulse"></div>
                    <Loader2 className="w-20 h-20 text-[#0D9488] animate-spin relative z-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Agent compiling compliance packet...</h2>
                <p className="text-slate-500 max-w-md">Finalizing documentation, verifying permits, and generating PDF report.</p>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-primary">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Activation Setup</h1>
                    <p className="text-slate-500 font-medium">{activationTitle}</p>
                </div>

                {/* Compliance Checklist */}
                <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Compliance Checklist</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        {checklistItems.map((item) => (
                            <div key={item.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                                <div className="mt-1">
                                    <input
                                        type="checkbox"
                                        checked={item.checked}
                                        onChange={() => toggleCheck(item.id)}
                                        className="w-5 h-5 rounded border-slate-300 text-[#0D9488] focus:ring-[#0D9488]"
                                        id={`check-${item.id}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label htmlFor={`check-${item.id}`} className={`text-sm cursor-pointer ${item.checked ? 'text-slate-900 font-medium' : 'text-slate-600'}`}>
                                        {item.label}
                                    </label>
                                    {item.file && (
                                        <div className="flex items-center gap-2 mt-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded w-fit">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {item.file}
                                            <button onClick={() => removeFile(item.id)} className="ml-2 text-slate-400 hover:text-red-500">Remove</button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="file"
                                        id={`file-${item.id}`}
                                        className="hidden"
                                        onChange={(e) => handleFileUpload(item.id, e)}
                                    />
                                    <label
                                        htmlFor={`file-${item.id}`}
                                        className="cursor-pointer inline-flex items-center px-3 py-1.5 border border-slate-200 rounded text-xs font-medium text-slate-600 hover:text-[#0D9488] hover:border-[#0D9488] transition-colors bg-white"
                                    >
                                        {item.file ? 'Replace Proof' : 'Upload Proof'}
                                    </label>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Ambassador Details */}
                <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Ambassador Details</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="amb_name" className="text-slate-700">Ambassador Name</Label>
                            <Input
                                id="amb_name"
                                value={ambassador.name}
                                onChange={(e) => setAmbassador({ ...ambassador, name: e.target.value })}
                                placeholder="Full Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="amb_phone" className="text-slate-700">Ambassador Phone</Label>
                            <Input
                                id="amb_phone"
                                value={ambassador.phone}
                                onChange={(e) => setAmbassador({ ...ambassador, phone: e.target.value })}
                                placeholder="(555) 123-4567"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="amb_email" className="text-slate-700">Ambassador Email</Label>
                            <Input
                                id="amb_email"
                                value={ambassador.email}
                                onChange={(e) => setAmbassador({ ...ambassador, email: e.target.value })}
                                placeholder="email@example.com"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Additional Notes */}
                <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Additional Notes</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Any special instructions or context for this activation..."
                            className="min-h-[100px]"
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        variant="outline"
                        className="flex-1 h-12 text-lg border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        Save Draft
                    </Button>
                    <Button
                        onClick={handleGeneratePacket}
                        className="flex-1 h-12 text-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-lg shadow-teal-900/10 disabled:opacity-50"
                        disabled={checkedCount < 3 || loading}
                    >
                        📦 Generate Compliance Packet
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function ActivationSetupPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ActivationSetupContent />
        </Suspense>
    )
}
