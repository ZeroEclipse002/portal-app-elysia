import { useState } from "react"
import { Signin } from "./Signin"
import Signup from "./Signup"



export const ModalAuth = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<"signin" | "signup">("signin")

    return (
        <>
            <div className="inline-flex items-center space-x-6">
                <button
                    className="text-base font-medium leading-6 text-gray-600 whitespace-no-wrap transition duration-150 ease-in-out hover:text-gray-900"
                    onClick={() => {
                        setIsOpen(true)
                        setMode("signin")
                    }}
                >
                    Sign in
                </button>
                <button
                    className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                    onClick={() => {
                        setIsOpen(true)
                        setMode("signup")
                    }}
                >
                    Sign up
                </button>
            </div>

            {isOpen && (
                <div className="fixed inset-0 z-50">
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="fixed inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-lg shadow-xl relative max-w-md w-full mx-4">
                            <button
                                className="absolute -right-2 -top-2 p-1 bg-white rounded-full shadow-lg border border-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
                                onClick={() => setIsOpen(false)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="flex w-full border-b border-gray-200">
                                <button
                                    className={`flex-1 px-6 py-3 text-sm font-medium ${mode === "signin"
                                        ? "text-indigo-600 border-b-2 border-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setMode("signin")}
                                >
                                    Sign in
                                </button>
                                <button
                                    className={`flex-1 px-6 py-3 text-sm font-medium ${mode === "signup"
                                        ? "text-indigo-600 border-b-2 border-indigo-600"
                                        : "text-gray-500 hover:text-gray-700"
                                        }`}
                                    onClick={() => setMode("signup")}
                                >
                                    Sign up
                                </button>
                            </div>

                            <div className="p-6">
                                {mode === "signin" ? <Signin /> : <Signup />}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}