import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { FirebaseProvider } from "./context/FirebaseContext";
import RewardProvider from "./components/RewardProvider";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";
import Journal from "./pages/Journal";
import Notes from "./pages/Notes";
import Chronicles from "./pages/Chronicles";
import Goals from "./pages/Goals";
import Habits from "./pages/Habits";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Memories from "./pages/Memories";
import Motivation from "./pages/Motivation";
import NotFound from "./pages/NotFound";
import Todos from "./pages/Todos";
import Test from "./pages/Test";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import HowToUse from "./pages/HowToUse";
import { AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import MinimalApp from "./MinimalApp";
import { AnimationProvider } from "./components/providers/AnimationProvider";
import { LazyMotion, domAnimation } from "framer-motion";

const queryClient = new QueryClient();

const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <Layout><Calendar /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/journal" element={
          <ProtectedRoute>
            <Layout><Journal /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/notes" element={
          <ProtectedRoute>
            <Layout><Notes /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/chronicles" element={
          <ProtectedRoute>
            <Layout><Chronicles /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/goals" element={
          <ProtectedRoute>
            <Layout><Goals /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/habits" element={
          <ProtectedRoute>
            <Layout><Habits /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/todos" element={
          <ProtectedRoute>
            <Layout><Todos /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout><Analytics /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/history" element={
          <ProtectedRoute>
            <Layout><History /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/how-to-use" element={
          <ProtectedRoute>
            <Layout><HowToUse /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/memories" element={
          <ProtectedRoute>
            <Layout><Memories /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/motivation" element={
          <ProtectedRoute>
            <Layout><Motivation /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout><Settings /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } />
        
        {/* Test routes */}
        <Route path="/test" element={
          <ProtectedRoute>
            <Layout><Test /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/test-direct" element={<Test />} />
        
        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

// Safe app wrapper to handle Firebase initialization errors
const App = () => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      if (event.reason?.code && 
          (event.reason.code.includes('auth') || 
           event.reason.code.includes('firebase'))) {
        setHasError(true);
      }
    };

    // Handle runtime errors
    const handleError = (event: ErrorEvent) => {
      console.error("Runtime error:", event.error);
      if (event.error?.stack && 
          (event.error.stack.includes('firebase') || 
           event.error.stack.includes('auth'))) {
        setHasError(true);
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // Show fallback UI if there's an error
  if (hasError) {
    return <MinimalApp />;
  }

  // Render the full app with all providers
  try {
    return (
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <ThemeProvider>
              <AuthProvider>
                <FirebaseProvider>
                  <RewardProvider>
                    <LazyMotion features={domAnimation}>
                      <AnimationProvider>
                        <AppRoutes />
                      </AnimationProvider>
                    </LazyMotion>
                    <Toaster />
                    <Sonner />
                  </RewardProvider>
                </FirebaseProvider>
              </AuthProvider>
            </ThemeProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );
  } catch (error) {
    console.error("Critical app render error:", error);
    return <MinimalApp />;
  }
};

export default App;
