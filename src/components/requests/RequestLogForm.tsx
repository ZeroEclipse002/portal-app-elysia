import type { FormLog } from "@/db/schema"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { useState, useTransition } from "react"
import { actions } from "astro:actions"
import { toast } from "sonner"
import { useSWRConfig } from "swr"

type FormFields = {
    fullName: string;
    birthDate: string;
    completeAddress: string;
    purpose: string;
    yearsOfResidence: string;
    birthPlace: string;
    currentAddress: string;
}

export const RequestLogForm = ({ logFormData, docType, requestLogId, requestId, formLogId }: { logFormData: FormLog, docType: string, requestLogId: string, requestId: string, formLogId: string }) => {
    const [formData, setFormData] = useState<FormFields>({
        fullName: logFormData.form?.fullName ?? '',
        birthDate: logFormData.form?.birthDate ?? '',
        completeAddress: logFormData.form?.completeAddress ?? '',
        purpose: logFormData.form?.purpose ?? '',
        yearsOfResidence: logFormData.form?.yearsOfResidence ?? '',
        birthPlace: logFormData.form?.birthPlace ?? '',
        currentAddress: logFormData.form?.currentAddress ?? '',
    })
    const { mutate } = useSWRConfig()

    const [pending, startTransition] = useTransition()

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        console.log(formData)

        startTransition(async () => {
            try {
                const response = await actions.submitForm({
                    requestUpdateId: requestLogId,
                    formType: docType as 'residence' | 'indigency' | 'clearance',
                    form: formData as any,
                    requestFormLogId: formLogId
                })

                if (response.data) {
                    toast.success('Form submitted successfully')
                } else {
                    toast.error('Error submitting form')
                }
            } catch (error) {
                toast.error('Error submitting form')
                console.error(error)
            } finally {
                mutate(`/api/requestlogs/${requestId}`)
            }
        })
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="fullName"
                    name="fullName"
                    value={formData.fullName || ''}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate || ''}
                    onChange={handleChange}
                    placeholder="Enter your birth date"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="completeAddress">Complete Address</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="completeAddress"
                    name="completeAddress"
                    value={formData.completeAddress || ''}
                    onChange={handleChange}
                    placeholder="Enter your complete address"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="purpose"
                    name="purpose"
                    value={formData.purpose || ''}
                    onChange={handleChange}
                    placeholder="Enter your purpose"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="yearsOfResidence">Years of Residence</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="yearsOfResidence"
                    name="yearsOfResidence"
                    value={formData.yearsOfResidence || ''}
                    onChange={handleChange}
                    placeholder="Enter your years of residence"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="birthPlace">Birth Place</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="birthPlace"
                    name="birthPlace"
                    value={formData.birthPlace || ''}
                    onChange={handleChange}
                    placeholder="Enter your birth place"
                    required
                />
            </div>
            {docType === 'residence' && (<div className="space-y-2">
                <Label htmlFor="currentAddress">Current Address</Label>
                <Input
                    disabled={pending || logFormData.form !== null}
                    id="currentAddress"
                    name="currentAddress"
                    value={formData.currentAddress || ''}
                    onChange={handleChange}
                    placeholder="Enter your current address"
                    required
                />
            </div>)}
            <Button type="submit" className="w-full" disabled={pending || logFormData.form !== null}>
                Submit
            </Button>
        </form >
    )
}