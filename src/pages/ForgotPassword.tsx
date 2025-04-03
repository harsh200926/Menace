import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    try {
      setError("");
      setMessage("");
      setLoading(true);
      await resetPassword(email);
      setMessage("Check your email for password reset instructions");
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to reset password. Please check if the email is correct.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center bg-background">
      <div className="flex justify-center mb-4">
        <Link to="/" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><polygon points="13 2 3 14 13 14 11 22 21 10 11 10 13 2"></polygon></svg>
          <span className="text-xl font-bold">GoalWhisper</span>
        </Link>
      </div>
      
      <div className="mx-auto w-full max-w-md px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h1 className="text-3xl font-bold">Reset password</h1>
            <p className="text-muted-foreground mt-2">
              We'll send you a link to reset your password
            </p>
          </div>
          
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-4">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in-50 duration-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {message && (
              <Alert className="bg-primary/10 text-primary border-primary/20">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="focus-visible:ring-primary transition-shadow duration-200"
                  autoComplete="email"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full transition-all rounded-md"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    Sending email...
                  </>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </div>
          
          <div className="text-center">
            <Button 
              variant="link" 
              className="font-semibold hover:underline flex items-center mx-auto" 
              onClick={() => navigate("/login")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to login
            </Button>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold hover:underline"
              onClick={() => navigate("/signup")}
            >
              Sign up
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 