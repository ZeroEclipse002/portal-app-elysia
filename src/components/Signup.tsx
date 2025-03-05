import { authClient } from "@/lib/auth-client";
import { SITE_KEY } from "astro:env/client";
import { useRef, useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [error, setError] = useState("");
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
          //redirect to the dashboard
        },
        onError: (ctx) => {
          setError(ctx.error.message || "An error occurred");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto p-8 z-30 bg-white">
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
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ReCAPTCHA sitekey={SITE_KEY} className="z-[999]" ref={recaptcha} />
      {error && <p className="text-red-500">{error}</p>}
      <button
        onClick={signUp}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Sign Up
      </button>
    </div>
  );
}
