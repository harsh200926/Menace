import { motion } from "framer-motion";
import LoginForm from "@/components/Auth/LoginForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { currentUser } = useAuth();
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side - Illustration/Background */}
      <div className="hidden lg:flex bg-gradient-to-br from-primary/90 to-primary-foreground/80 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-10 z-0"></div>
        
        <div className="z-10 max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-6">Welcome to GoalWhisper</h1>
            <p className="text-xl mb-8">
              Your personal journey to growth and achievement starts here.
            </p>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-target"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Set and achieve goals</h3>
                  <p className="text-sm opacity-80">Track your progress and stay motivated</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list-checks"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Build powerful habits</h3>
                  <p className="text-sm opacity-80">Create routines that lead to success</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Visualize your progress</h3>
                  <p className="text-sm opacity-80">See your growth with powerful analytics</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="mx-auto w-full max-w-md">
          <div className="flex justify-center mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="13 2 3 14 13 14 11 22 21 10 11 10 13 2"></polygon></svg>
              <span className="text-xl font-bold">GoalWhisper</span>
            </Link>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="text-center lg:text-left">
              <h1 className="text-3xl font-bold">Welcome back</h1>
              <p className="text-muted-foreground mt-2">
                Sign in to continue your journey
              </p>
            </div>
            
            <LoginForm />
            
            {/* Development tools section */}
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-1">Development Tools</h3>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.setItem('bypassAuth', 'true');
                      window.location.href = '/';
                    }}
                  >
                    Bypass Auth (Dev Only)
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      localStorage.removeItem('bypassAuth');
                      window.location.reload();
                    }}
                  >
                    Disable Bypass
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
} 