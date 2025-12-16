import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button"; // Assuming you have this from shadcn
import { Loader2 } from "lucide-react"; // Or any icon library you use
import { VERIFY_EMAIL_ROUTE } from "@/utils/constant";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // State to manage the UI view
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      toast.error("No verification token found.");
      return;
    }

    const verifyUserEmail = async () => {
      try {
        const response = await fetch(VERIFY_EMAIL_ROUTE, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          toast.success("Email verified successfully!");
          // Optional: Auto redirect after 3 seconds
          setTimeout(() => {
            navigate("/signin");
          }, 3000);
        } else {
          setStatus("error");
          toast.error(data.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setStatus("error");
        toast.error("Something went wrong. Please try again.");
      }
    };

    verifyUserEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center space-y-6">
        {/* LOADING STATE */}
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-orange-600 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
            <p className="text-gray-600">
              Please wait while we verify your email.
            </p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && (
          <div className="space-y-4">
            <div className="text-green-500 text-6xl flex justify-center">✓</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Email Verified!
            </h2>
            <p className="text-gray-600">
              Your account has been successfully verified. You will be
              redirected shortly.
            </p>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={() => navigate("/signin")}
            >
              Go to Sign In Now
            </Button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && (
          <div className="space-y-4">
            <div className="text-red-500 text-6xl flex justify-center">✕</div>
            <h2 className="text-2xl font-bold text-gray-800">
              Verification Failed
            </h2>
            <p className="text-gray-600">
              The link may be invalid or expired. Please try signing up again or
              contact support.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/signup")}
            >
              Back to Sign Up
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
