import { authClient } from "@/lib/auth-client";
import { SITE_KEY } from "astro:env/client";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const recaptcha = useRef<ReCAPTCHA>(null);

  const signUp = async () => {
    console.log("signUp", email, password, name);
    const { data, error } = await authClient.signUp.email(
      {
        email,
        password,
        name,
      },
      {
        onRequest: () => {
          if (!recaptcha.current.getValue()) {
            setError("Recaptcha verification failed");
            throw new Error("Recaptcha verification failed");
          }
        },
        onSuccess: (ctx) => {
          setShowSuccess(true);
        },
        onError: (ctx) => {
          setError(ctx.error.message || "An error occurred");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-8 z-30 bg-white">
      {showSuccess ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Account Created Successfully!
          </h2>
          <p className="text-gray-600 mb-6">
            Your account has been created. You can now sign in.
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Home
          </button>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold">Sign Up</h1>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border w-full border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 focus:outline-none"
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeOffIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          <ReCAPTCHA sitekey={SITE_KEY} className="z-[999]" ref={recaptcha} />
          {error && <p className="text-red-500">{error}</p>}
          <button
            onClick={signUp}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Sign Up
          </button>
        </>
      )}
    </div>
  );
}
