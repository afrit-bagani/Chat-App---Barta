import { useEffect, useState } from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

// Local import
import LandingPage from "@/pages/LandingPage";
import SignUpPage, { signUpAction } from "@/pages/auth/SignUpPage";
import SignInPage, { signInAction } from "@/pages/auth/SignInPage";
import Profile, { ProfileAction } from "@/pages/ProfilePage";
import Chat from "@/pages/chat/Chat";
import NotFoundPage from "@/pages/NotFoundPage";
import { useUserStore } from "@/store";
import { GET_USER_DATA_ROUTE } from "@/utils/constant";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import SocketProvider from "@/context";
import { Spinner } from "./components/ui/spinner";
import VerifyEmail from "./pages/VerifyEmail";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useUserStore().user;
  const isAuthenticate = user;
  return isAuthenticate ? children : <Navigate to="/signin" />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
    action: signUpAction,
  },
  {
    path: "/signin",
    element: <SignInPage />,
    action: signInAction,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    ),
    action: ProfileAction,
  },
  {
    path: "/chat",
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default function App() {
  const { user, setUser } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const getUserData = async () => {
      try {
        const res = await fetch(GET_USER_DATA_ROUTE, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });

        if (!res.ok) {
          return toast.error("Failed to fetch user data.");
        }

        const data = await res.json();
        if (!mounted) return;
        setUser(data.data.user);
      } catch (error) {
        console.error("Failed to fetch user data: \n", error);
        toast.error("Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (!user) {
      getUserData();
    } else {
      setLoading(false);
    }
    return () => {
      mounted = false;
    };
  }, [user, setUser]);

  if (loading)
    return (
      <div className="flex flex-col gap-2">
        <Spinner />
        <span>Loading ...</span>
      </div>
    );

  return (
    <SocketProvider>
      <RouterProvider router={router} />
      <Toaster richColors />
    </SocketProvider>
  );
}
