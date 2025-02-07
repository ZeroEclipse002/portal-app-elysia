import type { FamilyData } from "@/db/schema";
import { actions, isInputError } from "astro:actions";
import { navigate } from "astro:transitions/client";
import { PlusIcon, UserPlusIcon, XIcon } from "lucide-react";
import { useState, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

const InitialModalClient = ({ path }: { path: string }) => {
    const [nestedModal, setNestedModal] = useState<boolean>(false);
    const [familyMembers, setFamilyMembers] = useState<FamilyData[]>([]);
    const [personalDetails, setPersonalDetails] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        birthDate: '',
        gender: ''
    });
    const [error, setError] = useState<string[]>([]);

    const handlePersonalDetailsChange = (field: string, value: string) => {
        setPersonalDetails(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const addFamilyMemberForm = useCallback(() => {
        setFamilyMembers(prev => [...prev, {
            id: Date.now(),
            fullName: '',
            email: '',
            phone: '',
            birthDate: '',
            gender: '',
            relationship: ''
        }]);
    }, []);

    const updateFamilyMember = useCallback((index: number, field: keyof FamilyData, value: string) => {
        setFamilyMembers(prev => {
            const updatedMembers = [...prev];
            updatedMembers[index] = { ...updatedMembers[index], [field]: value };
            return updatedMembers;
        });
    }, []);

    const handleSubmit = useCallback(async () => {
        const formData = {
            personalDetails: {
                firstName: personalDetails.firstName,
                lastName: personalDetails.lastName,
                phone: personalDetails.phone,
                address: personalDetails.address,
                birthDate: personalDetails.birthDate,
                gender: personalDetails.gender
            },
            familyMembers: familyMembers.map(member => ({
                fullName: member.fullName,
                birthDate: member.birthDate,
                gender: member.gender,
                relationship: member.relationship
            }))
        };

        console.log('Form Submission Data:', formData);

        try {
            setError([])
            const response = actions.initDetails({
                personalDetails: formData.personalDetails,
                familyMembers: formData.familyMembers
            })

            toast.promise(response, {
                loading: 'Saving details...',
                success: (e) => {
                    if (isInputError(e.error)) {
                        let errorMessage = []
                        if (e.error.fields?.personalDetails) {
                            errorMessage.push(...e.error.fields?.personalDetails)
                        }
                        if (e.error.fields?.familyMembers) {
                            errorMessage.push(...e.error.fields?.familyMembers)
                        }
                        console.log(errorMessage)
                        setError(errorMessage)
                        return 'Failed to save details'
                    }
                    return 'Details saved successfully'
                },
                error: 'Failed to save details'
            })
        } catch (error) {
            console.error(error)
        } finally {
            navigate("/")
        }
    }, [personalDetails, familyMembers]);

    // Update the input and select base styles
    const inputStyles = "w-full p-2.5 rounded-lg border-slate-200 bg-slate-50 text-slate-700 border focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none placeholder:text-slate-400";
    const labelStyles = "block text-sm font-medium text-slate-600 mb-1.5";

    const FamilyMemberForm = useMemo(() => {
        return familyMembers.map((member, index) => (
            <div key={index} className="flex flex-col gap-5 bg-slate-50 p-4 md:p-7 rounded-xl border border-slate-100 relative">
                {/* Remove Member Button */}
                <button
                    onClick={() => {
                        setFamilyMembers(prev => prev.filter((_, i) => i !== index));
                    }}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                        <label className={labelStyles}>Full Name</label>
                        <input
                            type="text"
                            placeholder="Enter full name"
                            value={member.fullName}
                            onChange={(e) => updateFamilyMember(index, 'fullName', e.target.value)}
                            className={inputStyles}
                        />
                    </div>
                    <div className="flex-1">
                        <label className={labelStyles}>Birth Date</label>
                        <input
                            type="date"
                            value={member.birthDate}
                            onChange={(e) => updateFamilyMember(index, 'birthDate', e.target.value)}
                            className={inputStyles}
                        />
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="flex-1">
                        <label className={labelStyles}>Gender</label>
                        <select
                            value={member.gender}
                            onChange={(e) => updateFamilyMember(index, 'gender', e.target.value)}
                            className={inputStyles}
                        >
                            <option value="">Select gender</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className={labelStyles}>Relationship</label>
                        <select
                            value={member.relationship}
                            onChange={(e) => updateFamilyMember(index, 'relationship', e.target.value)}
                            className={inputStyles}
                        >
                            <option value="">Select relationship</option>
                            <option value="spouse">Spouse</option>
                            <option value="child">Child</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>
        ));
    }, [familyMembers, updateFamilyMember]);

    const AddMemberButton = useMemo(() => (
        <button
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors duration-200"
            onClick={addFamilyMemberForm}
        >
            Add Family Member
            <PlusIcon className="w-5 h-5" />
        </button>
    ), [addFamilyMemberForm]);

    // Main Modal Content
    const MainModalContent = useMemo(() => (
        <div className="flex flex-col gap-5 bg-white p-4 md:p-7 rounded-xl shadow-sm">
            <h2 className="text-xl font-semibold text-slate-800">Personal Details</h2>
            <p className="text-slate-600 text-sm">Please fill in the following details to get started.</p>
            {error.length > 0 && (<div className="flex flex-col gap-2 border border-red-500 p-2 rounded-lg">
                {error.map((e, index) => (
                    <p key={index} className="text-red-500 text-sm">{e}</p>
                ))}
            </div>)}
            <div className="flex justify-between gap-4">
                <div className="flex-1">
                    <label className={labelStyles}>First Name</label>
                    <input
                        type="text"
                        placeholder="Enter first name"
                        value={personalDetails.firstName}
                        onChange={(e) => handlePersonalDetailsChange('firstName', e.target.value)}
                        className={inputStyles}
                    />
                </div>
                <div className="flex-1">
                    <label className={labelStyles}>Last Name</label>
                    <input
                        type="text"
                        placeholder="Enter last name"
                        value={personalDetails.lastName}
                        onChange={(e) => handlePersonalDetailsChange('lastName', e.target.value)}
                        className={inputStyles}
                    />
                </div>
            </div>

            <div className="flex justify-between gap-4">
                <div className="flex-1">
                    <label className={labelStyles}>Phone Number</label>
                    <input
                        type="tel"
                        placeholder="Enter phone number"
                        value={personalDetails.phone}
                        onChange={(e) => handlePersonalDetailsChange('phone', e.target.value)}
                        className={inputStyles}
                    />
                </div>
                <div className="flex-1">
                    <label className={labelStyles}>Birth Date</label>
                    <input
                        type="date"
                        value={personalDetails.birthDate}
                        onChange={(e) => handlePersonalDetailsChange('birthDate', e.target.value)}
                        className={inputStyles}
                    />
                </div>
            </div>

            <div className="flex justify-between gap-4">
                <div className="flex-1">
                    <label className={labelStyles}>Gender</label>
                    <select
                        value={personalDetails.gender}
                        onChange={(e) => handlePersonalDetailsChange('gender', e.target.value)}
                        className={inputStyles}
                    >
                        <option value="">Select gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div className="flex-1">
                    <label className={labelStyles}>Address</label>
                    <input
                        type="text"
                        placeholder="Enter address"
                        value={personalDetails.address}
                        onChange={(e) => handlePersonalDetailsChange('address', e.target.value)}
                        className={inputStyles}
                    />
                </div>
            </div>

            <p className="text-slate-600 text-sm">You have added {familyMembers.length} family members</p>
            <button
                onClick={() => setNestedModal(true)}
                className="mt-4 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-lg transition-colors duration-200"
            >
                Add Family Members
                <UserPlusIcon className="w-5 h-5" />
            </button>

            {/* Submit Button */}
            <button
                onClick={handleSubmit}
                className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-lg transition-colors duration-200"
            >
                Submit
            </button>
        </div>
    ), [personalDetails, familyMembers, handleSubmit, error]);

    return (
        <>
            <div className="flex-1 flex flex-col gap-3 bg-slate-100 p-3 md:p-6 rounded-xl m-2 overflow-y-auto">
                {MainModalContent}
            </div>

            {/* Nested Modal for Family Members */}
            {nestedModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4">
                    <div className="bg-white rounded-xl w-full h-full md:w-[80%] md:h-[80vh] md:max-w-4xl flex flex-col">
                        {/* Fixed Header */}
                        <div className="flex-shrink-0 flex flex-col md:flex-row items-start md:items-center justify-between p-4 md:p-7 border-b border-slate-100">
                            <h2 className="text-xl font-semibold text-slate-800 mb-4 md:mb-0">Add Family Members</h2>
                            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                                <p className="text-slate-600 text-sm">Please add at least one family member</p>
                                <span className="text-sm text-slate-600 bg-slate-100 p-2 rounded-lg">
                                    {familyMembers.length} {familyMembers.length === 1 ? 'member' : 'members'} added
                                </span>
                                <button
                                    onClick={() => setNestedModal(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-7">
                            <div className="space-y-5 pb-4">
                                {FamilyMemberForm}
                                {AddMemberButton}
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex-shrink-0 p-4 md:p-7 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setNestedModal(false)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setNestedModal(false);
                                }}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors duration-200"
                            >
                                Save Family Members
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InitialModalClient;