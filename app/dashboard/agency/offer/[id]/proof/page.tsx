
'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UploadProofPage() {
    const { id } = useParams()
    const router = useRouter()
    const supabase = createClient()
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [attendance, setAttendance] = useState('')

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const executeUpload = async () => {
        if (!file || !attendance) {
            setErrorMsg('Please select a photo and enter attendance.')
            return
        }
        setErrorMsg('')
        setLoading(true)

        try {
            // 1. Upload Image
            const fileExt = file.name.split('.').pop()
            const fileName = `${id}-${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('proofs')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // 2. Update Offer
            const { error: updateError } = await supabase
                .from('offers')
                .update({
                    status: 'completed',
                    proof_image_path: filePath,
                    estimated_attendance: parseInt(attendance)
                })
                .eq('id', id)

            if (updateError) throw updateError

            // Success: clear state? No need, we redirect.
            router.refresh()
            router.push('/dashboard/bar')

        } catch (error: any) {
            console.error(error)
            setErrorMsg('Error: ' + error.message)
            setLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto py-8">
            <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary" onClick={() => router.back()}>
                &larr; Back to Offer
            </Button>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
                    <CardTitle className="text-xl font-bold text-slate-900">Complete Activation</CardTitle>
                    <CardDescription>Submit your proof of performance to finalize the campaign.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <div className="space-y-8">
                        {errorMsg && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-200 flex items-center">
                                <span className="mr-2">⚠️</span> {errorMsg}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Label className="text-slate-900 font-semibold">1. Proof of Activation Photo <span className="text-red-500">*</span></Label>
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    required
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="pointer-events-none">
                                    <span className="text-4xl block mb-2">📷</span>
                                    <p className="text-sm font-medium text-slate-900">
                                        {file ? file.name : "Click to upload or drag and drop"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">JPG, PNG up to 5MB</p>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500">Ensure the brand logo and crowd are clearly visible.</p>
                        </div>

                        <div className="space-y-4">
                            <Label className="text-slate-900 font-semibold">2. Estimated Attendance <span className="text-red-500">*</span></Label>
                            <Input
                                type="number"
                                placeholder="e.g. 150"
                                value={attendance}
                                onChange={e => setAttendance(e.target.value)}
                                required
                                className="max-w-[200px]"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button className="w-full bg-zinc-900 hover:bg-zinc-800 text-white" disabled={loading || !file || !attendance}>
                                        {loading ? 'Uploading...' : 'Submit Proof & Complete'}
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Activation Completion</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Are you sure you want to submit this proof? This will mark the offer as completed and notify the brand immediately.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={executeUpload} className="bg-zinc-900 hover:bg-zinc-800">
                                            Confirm & Submit
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
