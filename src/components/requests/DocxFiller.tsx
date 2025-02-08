import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import { createReport } from 'docx-templates'; // Update import
import mammoth from 'mammoth';
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from '../ui/label';

interface FormData {
    fullName: string;
    age: number;
    birthDate: string;
    birthPlace: string;
    currentAddress: string;
    completeAddress: string;
    purpose: string;
    currentDate: string;
    yearsOfResidence?: string; // New field for residence certificate
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPE = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

function DocxFiller() {
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        age: 0,
        birthDate: '',
        birthPlace: '',
        currentAddress: '',
        completeAddress: '',
        purpose: '',
        currentDate: new Date().toISOString().split('T')[0],
        yearsOfResidence: '',
    });

    const [docxFile, setDocxFile] = useState<File | null>(null);
    const [selectedTemplate, setSelectedTemplate] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const handleTemplateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const templatePath = e.target.value;
        setSelectedTemplate(templatePath);
    };

    // Replace the file input in the render section with this select component
    const validateFile = (file: File): boolean => {
        setError('');

        if (file.size > MAX_FILE_SIZE) {
            setError('File size exceeds 5MB limit');
            return false;
        }

        if (file.type !== ALLOWED_FILE_TYPE) {
            setError('Please upload a valid DOCX file');
            return false;
        }

        return true;
    };

    const generatePreview = async () => {
        if (!docxFile) return;

        try {
            const templateArrayBuffer = await docxFile.arrayBuffer();
            const filledDocument = await createReport({
                template: templateArrayBuffer,
                data: formData,
                cmdDelimiter: ['+++INS', '+++'],
                noSandbox: true,
            });

        } catch (error) {
            console.error("Error generating preview:", error);
            setError("Failed to generate preview.");
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        generatePreview();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && validateFile(file)) {
            setDocxFile(file);
            generatePreview();
        } else {
            event.target.value = '';
            setDocxFile(null);
        }
    };

    const handleDownload = async () => {
        if (!formData.fullName || !formData.age) {
            setError("Please fill in all required fields.");
            return;
        }

        setIsLoading(true);
        try {
            const fileDoc = await fetch(selectedTemplate).then((res) => res.blob());
            const templateArrayBuffer = await fileDoc.arrayBuffer();
            const filledDocument = await createReport({
                template: templateArrayBuffer,
                data: formData,
                cmdDelimiter: ['+++INS', '+++'],
                noSandbox: true,
            });

            const blob = new Blob([filledDocument], {
                type: ALLOWED_FILE_TYPE,
            });
            saveAs(blob, `${formData.fullName}_Document_${Date.now()}.docx`);
        } catch (error) {
            console.error("Error downloading document:", error);
            setError("Failed to download document.");
        } finally {
            setIsLoading(false);
        }
    };

    // Update the button in the return statement
    return (
        <div className="w-full h-fit bg-slate-50 rounded-xl p-6">
            <div className="flex flex-col gap-4">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-800">Document Generator</h2>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Full Name</Label>
                                <Input
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Age</Label>
                                <Input
                                    type="number"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleInputChange}
                                    placeholder="Enter your age"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Birth Date</Label>
                                <Input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Birth Place</Label>
                                <Input
                                    name="birthPlace"
                                    value={formData.birthPlace}
                                    onChange={handleInputChange}
                                    placeholder="Enter your birth place"
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Address</Label>
                                <Input
                                    name="currentAddress"
                                    value={formData.currentAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter your current address"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Complete Address</Label>
                                <Input
                                    name="completeAddress"
                                    value={formData.completeAddress}
                                    onChange={handleInputChange}
                                    placeholder="Enter your complete address"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Purpose</Label>
                                <Input
                                    name="purpose"
                                    value={formData.purpose}
                                    onChange={handleInputChange}
                                    placeholder="Enter purpose"
                                />
                            </div>

                            {selectedTemplate === '/residence.docx' && (
                                <div className="space-y-2">
                                    <Label>Years of Residence</Label>
                                    <Input
                                        name="yearsOfResidence"
                                        value={formData.yearsOfResidence}
                                        onChange={handleInputChange}
                                        placeholder="Enter years of residence"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 space-y-3">
                        <Select
                            value={selectedTemplate}
                            onValueChange={setSelectedTemplate}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="/clearance.docx">Clearance</SelectItem>
                                <SelectItem value="/indigency.docx">Indigency</SelectItem>
                                <SelectItem value="/residence.docx">Residence</SelectItem>
                            </SelectContent>
                        </Select>

                        <button
                            onClick={handleDownload}
                            disabled={isLoading || !selectedTemplate || !formData.fullName || !formData.age}
                            className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    Processing...
                                </span>
                            ) : (
                                'Generate Document'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DocxFiller;