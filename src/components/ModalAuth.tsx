import { useState, useEffect } from "react"
import { Signin } from "./Signin"
import Signup from "./Signup"
import { X } from "lucide-react"
import { createPortal } from "react-dom"

export const ModalAuth = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<"signin" | "signup">("signin")

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    return (
        <>
            <div className="flex items-center space-x-6">
                <div className="flex-1" />
                <button
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => {
                        setMode("signin")
                        setIsOpen(true)
                    }}
                >
                    Sign in
                </button>
                <button
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    onClick={() => {
                        setMode("signup")
                        setIsOpen(true)
                    }}
                >
                    Sign up
                </button>
            </div>

            {isOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="relative max-w-md w-full bg-slate-50 rounded-lg">
                        <button
                            className="absolute right-4 top-4 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </button>

                        <div className="p-6">
                            <a href="/" className="flex items-center p-5 font-medium text-gray-900 md:mb-0">
                                <img src="/marawoy-logo.png" className="mr-3 h-12 w-auto" alt="Marawoy Logo" />
                                <span className="text-xl font-black leading-none text-gray-900 select-none">
                                    Marawoy<span className="text-indigo-600">.</span>
                                </span>
                                <p className="text-xs text-gray-600 leading-relaxed ml-4">
                                    Barangay Portal
                                </p>
                            </a>

                            <div className="flex w-full bg-white rounded-lg p-1 mb-6">
                                <button
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        mode === "signin"
                                            ? "bg-red-500 text-white"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                    onClick={() => setMode("signin")}
                                >
                                    Sign in
                                </button>
                                <button
                                    className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                        mode === "signup"
                                            ? "bg-red-500 text-white"
                                            : "text-gray-600 hover:text-gray-900"
                                    }`}
                                    onClick={() => setMode("signup")}
                                >
                                    Sign up
                                </button>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                {mode === "signin" ? <Signin /> : <Signup />}
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}