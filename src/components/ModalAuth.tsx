import { useState } from "react"
import { Signin } from "./Signin"
import Signup from "./Signup"
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { X } from "lucide-react"

export const ModalAuth = () => {
    const [isOpen, setIsOpen] = useState(false)
    const [mode, setMode] = useState<"signin" | "signup">("signin")

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <div className="flex items-center space-x-6">
                <div className="flex-1" />
                <DialogTrigger asChild>
                    <button
                        className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        onClick={() => setMode("signin")}
                    >
                        Sign in
                    </button>
                </DialogTrigger>
                <DialogTrigger asChild>
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                        onClick={() => setMode("signup")}
                    >
                        Sign up
                    </button>
                </DialogTrigger>
            </div>

            <DialogContent className="max-w-md bg-slate-50 p-0">
                {/* <button
                    className="absolute right-4 top-4 p-2 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:text-gray-900 transition-colors"
                    onClick={() => setIsOpen(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button> */}

                <div className="p-6">
                    <a href="/" className="flex items-center p-5 font-medium text-gray-900 md:mb-0">
                        <span className="text-xl font-black leading-none text-gray-900 select-none">
                            Marawoy<span className="text-indigo-600">.</span>
                        </span>
                        <p className="text-xs text-gray-600 leading-relaxed ml-4">
                            Barangay Portal
                        </p>
                    </a>

                    <div className="flex w-full bg-white rounded-lg p-1 mb-6">
                        <button
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "signin"
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:text-gray-900"
                                }`}
                            onClick={() => setMode("signin")}
                        >
                            Sign in
                        </button>
                        <button
                            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === "signup"
                                ? "bg-blue-500 text-white"
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
            </DialogContent>
        </Dialog>
    )
}