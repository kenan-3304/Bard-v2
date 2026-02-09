'use client'

import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, CheckCircle2, FileText, ExternalLink, Download } from 'lucide-react'

function CompliancePacketContent() {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Read all params
    const activationTitle = searchParams.get('title') || 'New Activation'
    const type = searchParams.get('type') || '-'
    const venue = searchParams.get('venue') || '-'
    const date = searchParams.get('date') || '-'
    const city = searchParams.get('city') || '-'
    const ambName = searchParams.get('amb_name') || '-'
    const ambPhone = searchParams.get('amb_phone') || '-'
    const ambEmail = searchParams.get('amb_email') || '-'
    const uploadedFilesRaw = searchParams.get('files') || ''
    const uploadedFiles = uploadedFilesRaw ? uploadedFilesRaw.split(',') : []

    return (
        <div className="max-w-4xl mx-auto py-8 px-6">
            <div className="mb-8">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0 hover:bg-transparent hover:text-primary">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>
            </div>

            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Compliance Packet</h1>
                        <p className="text-slate-500 font-medium">{activationTitle}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5" />
                        ✅ Packet Complete
                    </div>
                </div>

                {/* Packet Summary */}
                <Card className="border-slate-200">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg font-bold text-slate-900">Packet Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid md:grid-cols-2 gap-y-6 gap-x-8">
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Activation</p>
                            <p className="text-slate-900 font-medium">{activationTitle}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Type</p>
                            <p className="text-slate-900 font-medium">{type}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Venue</p>
                            <p className="text-slate-900 font-medium">{venue}, {city}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Date</p>
                            <p className="text-slate-900 font-medium">{date}</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">State</p>
                            <p className="text-slate-900 font-medium">Virginia</p>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Compliance Status</p>
                            <p className="text-emerald-600 font-bold">Compliant</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Agent Check</p>
                            <p className="text-slate-900 font-medium">Passed — no violations detected</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Completed Checklist */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#0D9488] rounded-full inline-block"></span>
                        Completed Checklist
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-6 space-y-4 border border-slate-200">
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span className="text-sm text-slate-700">Solicitor Tasting Permit obtained / active</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span className="text-sm text-slate-700">Tasting limited to licensed premises areas only</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span className="text-sm text-slate-700">No more than 6 oz wine / 2 oz spirits per person per day</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span className="text-sm text-slate-700">Brand ambassador present on-site at all times</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                            <span className="text-sm text-slate-700">Signage within VA ABC value limits ($215 per brand)</span>
                        </div>
                    </div>
                </div>

                {/* Uploaded Evidence */}
                {uploadedFiles.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-1 h-6 bg-slate-200 rounded-full inline-block"></span>
                            Uploaded Evidence
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {uploadedFiles.map((file, i) => (
                                <div key={i} className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg">
                                    <div className="bg-slate-100 p-2 rounded">
                                        <FileText className="w-5 h-5 text-slate-600" />
                                    </div>
                                    <span className="text-sm font-medium text-slate-700">{file}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ambassador Record */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-slate-200 rounded-full inline-block"></span>
                        Ambassador Record
                    </h3>
                    <Card className="border-slate-200">
                        <CardContent className="pt-6 grid md:grid-cols-3 gap-6">
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Name</p>
                                <p className="text-slate-900 font-medium">{ambName}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Phone</p>
                                <p className="text-slate-900 font-medium">{ambPhone}</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Email</p>
                                <p className="text-slate-900 font-medium">{ambEmail}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Required Forms */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <span className="w-1 h-6 bg-slate-200 rounded-full inline-block"></span>
                        Required Forms
                    </h3>
                    <a
                        href="https://www.abc.virginia.gov/library/licenses/pdfs/solicitortasting.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-[#0D9488] hover:shadow-sm transition-all group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-slate-100 p-2 rounded group-hover:bg-[#0D9488]/10 transition-colors">
                                <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-[#0D9488]" />
                            </div>
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Solicitor Tasting Permit (Form 805-97)</span>
                        </div>
                    </a>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        className="flex-1 h-12 text-lg bg-[#0D9488] hover:bg-[#0D9488]/90 text-white shadow-lg shadow-teal-900/10"
                    >
                        <Download className="mr-2 w-5 h-5" />
                        Download Packet (PDF)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push('/dashboard/brand')}
                        className="flex-1 h-12 text-lg border-slate-300 text-slate-600 hover:bg-slate-50"
                    >
                        Return to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default function CompliancePacketPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompliancePacketContent />
        </Suspense>
    )
}
