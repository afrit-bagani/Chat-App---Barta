import { useState } from "react";
import { Link, redirect, useFetcher } from "react-router-dom";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { toast } from "sonner";

// Local import
import { SIGN_IN_ROUTE } from "@/utils/constant";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store";

export const signInAction = async ({ request }: { request: Request }) => {
  const setUser = useUserStore.getState().setUser;
  const formData = await request.formData();
  const values = Object.fromEntries(
    Array.from(formData.entries()).map(([key, val]) => [key, val.toString()])
  );
  try {
    const res = await fetch(SIGN_IN_ROUTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
      credentials: "include",
    });
    const data = await res.json();
    if (!res.ok) {
      return toast.error(data.message || "Error while sending response");
    }
    if (!data.success) {
      return toast.error(data.message || "Error while signing in");
    }
    toast.success("Sign in successfully");
    setUser(data.data.user);
    if (data.data.user.profileSetup === false) {
      return redirect("/profile");
    }
    return redirect("/chat");
  } catch (error) {
    return toast.error("An unexpected error occurred. Please try again.");
  }
};

export default function SignInPage() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.state === "submitting";

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const inputCSS =
    "mt-1 w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm outline-none focus:bg-orange-50 focus:border-orange-500";
  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="min-w-md p-6 space-y-4 bg-white rounded-2xl shadow-2xl">
        <div className="text-center">
          <h1 className="text-orange-600 text-2xl md:text-5xl font-bold">
            Sign In
          </h1>
          <p className="text-sm md:text-lg text-gray-700 mt-1">
            Welcome back, please login into your account
          </p>
        </div>

        <fetcher.Form
          method="post"
          className="text-sm text-gray-800 font-medium space-y-4"
        >
          {/* Email */}
          <div>
            <label htmlFor="email">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              name="email"
              title="Email Input"
              placeholder="Enter your example"
              autoComplete="email"
              required
              className={inputCSS}
            />
          </div>
          {/* Password */}
          <div>
            <label htmlFor="password">
              Password<span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                title="password Input"
                placeholder="Enter your password"
                required
                autoComplete="new-password"
                className={inputCSS}
                onChange={(e) => setPassword(e.target.value)}
              />
              {password.length > 0 && (
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowPassword((prev) => !prev)}
                  title="Toggle password visibility"
                  className="absolute inset-y-0 right-3  text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <FiEyeOff size={25} /> : <FiEye size={25} />}
                </button>
              )}
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Signing In ..." : "Sign In"}
          </Button>
        </fetcher.Form>
        <div className="text-sm text-gray-600 text-center">
          <Link to="/signup">
            Don't have an account?{" "}
            <span className="text-blue-700 font-medium underline">Sign Up</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
