import { authClient } from "@/lib/auth-client";
import React, { useState } from "react";

interface ChangePasswordCompProps {
    inputErrors?: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    };
    result?: {
        data?: {
            success?: boolean;
            message?: string;
        };
    };
    onSubmit: (values: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }) => void | Promise<void>;
}

const ChangePasswordComp = () => {
    const [currentPassword, setCurrentPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [error, setError] = useState<string | undefined>(undefined);
    const [success, setSuccess] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    // Password visibility states
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const { data, error } = await authClient.changePassword({
            newPassword: newPassword,
            currentPassword: currentPassword,
            revokeOtherSessions: true,
        });

        if (error) {
            console.error(error);
            setError(error.message);
            setIsLoading(false);
        }

        if (data) {
            console.log(data);
            setSuccess(true);
            setIsSuccess(true);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-lg">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Change Password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your current password and new password below
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="currentPassword" className="sr-only">
                                Current Password
                            </label>
                            <div className="relative">
                                <input
                                    id="currentPassword"
                                    name="currentPassword"
                                    type={showCurrent ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm pr-10"
                                    placeholder="Current Password"
                                    aria-describedby="current-password-error"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                                    tabIndex={-1}
                                    onClick={() => setShowCurrent((v) => !v)}
                                    aria-label={showCurrent ? "Hide password" : "Show password"}
                                >
                                    {showCurrent ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A9.956 9.956 0 0112 19c-1.657 0-3.234-.336-4.675-.938" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.4 4.6A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-7.4 9.6" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="sr-only">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type={showNew ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm pr-10"
                                    placeholder="New Password"
                                    aria-describedby="new-password-error"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                                    tabIndex={-1}
                                    onClick={() => setShowNew((v) => !v)}
                                    aria-label={showNew ? "Hide password" : "Show password"}
                                >
                                    {showNew ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A9.956 9.956 0 0112 19c-1.657 0-3.234-.336-4.675-.938" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.4 4.6A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-7.4 9.6" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="sr-only">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    required
                                    className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm pr-10"
                                    placeholder="Confirm New Password"
                                    aria-describedby="confirm-password-error"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
                                    tabIndex={-1}
                                    onClick={() => setShowConfirm((v) => !v)}
                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                >
                                    {showConfirm ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m2.062 2.675A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-2.062-2.675A9.956 9.956 0 0112 19c-1.657 0-3.234-.336-4.675-.938" /></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9.4 4.6A9.956 9.956 0 0112 5c5.523 0 10 4.477 10 10a9.956 9.956 0 01-7.4 9.6" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            {isLoading ? "Loading..." : "Change Password"}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-2 text-sm text-red-600" id="error-message">
                            {error}
                        </p>
                    )}
                    {isSuccess && (
                        <p className="mt-2 text-sm text-green-600" id="success-message">
                            Successfully changed password
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordComp;
