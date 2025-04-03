import { motion } from "framer-motion";
import SignupForm from "@/components/Auth/SignupForm";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";

export default function Signup() {
  const { currentUser } = useAuth();
  
  // Redirect if already logged in
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side - Illustration/Background */}
      <div className="hidden lg:flex bg-gradient-to-br from-primary-foreground/80 to-primary/90 flex-col justify-center items-center text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full bg-black/20 z-0"></div>
        <div className="absolute inset-0 bg-[url('/images/auth-pattern.svg')] opacity-10 z-0"></div>
        
        <div className="z-10 max-w-md mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-6">Start Your Journey</h1>
            <p className="text-xl mb-8">
              Join thousands of warriors who are achieving their dreams with GoalWhisper.
            </p>
            
            <div className="space-y-6">
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Create your profile</h3>
                  <p className="text-sm opacity-80">Personalize your experience</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 18v4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Sync across devices</h3>
                  <p className="text-sm opacity-80">Access your data anywhere</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-center p-4 bg-white/10 backdrop-blur-sm rounded-lg"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="mr-4 bg-white/20 p-3 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                </div>
                <div className="text-left">
                  <h3 className="font-medium">Secure data storage</h3>
                  <p className="text-sm opacity-80">Your information is protected</p>
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
              <h1 className="text-3xl font-bold">Create an account</h1>
              <p className="text-muted-foreground mt-2">
                Begin your personal growth journey today
              </p>
            </div>
            
            <SignupForm />
          </motion.div>
        </div>
      </div>
    </div>
  );
} 