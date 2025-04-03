import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  AlertCircle, 
  CheckCircle, 
  Camera, 
  Award, 
  Shield, 
  Upload, 
  Save, 
  User, 
  Lock, 
  Database,
  ClipboardCopy,
  Trash2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { migrateLocalStorageToFirestore } from "@/utils/firestoreUtils";
import { useToast } from "@/hooks/use-toast";
import { UserAvatar } from "@/components/ui/UserAvatar";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { currentUser, logout, updateUserProfile } = useAuth();
  const { toast } = useToast();
  
  const [profileTab, setProfileTab] = useState("account");
  const [migrating, setMigrating] = useState(false);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentUser || !currentUser.displayName) return "U";
    return currentUser.displayName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase();
  };

  // Calculate account age in days
  const getAccountAge = () => {
    if (!currentUser?.metadata?.creationTime) return 0;
    const creationTime = new Date(currentUser.metadata.creationTime);
    const now = new Date();
    return Math.floor((now.getTime() - creationTime.getTime()) / (1000 * 60 * 60 * 24));
  };
  
  // Level calculation
  const calculateLevel = () => {
    const days = getAccountAge();
    return Math.max(1, Math.floor(days / 7) + 1); // 1 level per week
  };
  
  // Experience calculation (0-99%)
  const calculateExperience = () => {
    const days = getAccountAge();
    return Math.min(99, (days % 7) * 14); // 0-99%
  };
  
  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !currentUser) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file");
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file size must be less than 5MB");
      return;
    }
    
    try {
      setError("");
      setUploading(true);
      
      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const previewElem = document.getElementById('profile-preview') as HTMLImageElement;
          if (previewElem) {
            previewElem.src = e.target.result as string;
            previewElem.style.display = 'block';
          }
        }
      };
      reader.readAsDataURL(file);
      
      // Upload to Firebase Storage
      const storageRef = ref(storage, `profile-images/${currentUser.uid}`);
      await uploadBytes(storageRef, file);
      
      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user profile
      await updateProfile(currentUser, {
        photoURL: downloadURL
      });
      
      toast({
        description: "Profile picture updated successfully!",
      });
      
      // Force refresh (consider alternative to full page refresh)
      setTimeout(() => {
        window.location.reload();
      }, 1000); 
    } catch (err) {
      console.error("Profile image upload error:", err);
      setError("Failed to upload profile image. Please try again.");
    } finally {
      setUploading(false);
    }
  };
  
  // Handle profile update
  const handleUpdateProfile = async () => {
    if (!currentUser) return;
    
    try {
      setError("");
      setSuccess("");
      setSaving(true);
      
      await updateUserProfile(displayName);
      
      setSuccess("Profile updated successfully!");
      toast({
        description: "Profile details saved successfully!",
      });
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  
  // Handle data migration
  async function handleMigrateData() {
    if (!currentUser) return;
    
    try {
      setError("");
      setMigrating(true);
      const success = await migrateLocalStorageToFirestore(currentUser.uid);
      
      if (success) {
        setMigrationComplete(true);
        toast({
          description: "Your data has been successfully migrated to the cloud.",
        });
      } else {
        setError("There was a problem migrating your data. Please try again.");
      }
    } catch (err) {
      console.error("Migration error:", err);
      setError("There was a problem migrating your data. Please try again.");
    } finally {
      setMigrating(false);
    }
  };
  
  // Handle logout
  async function handleLogout() {
    try {
      await logout();
    } catch (err) {
      console.error("Logout error:", err);
      setError("Failed to log out. Please try again.");
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>
              Please log in to view your profile
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = "/login"}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Warrior Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>
      
      {error && (
        <Alert variant="destructive" className="animate-in slide-in-from-top-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="bg-primary/10 text-primary border-primary/20 animate-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid gap-6 grid-cols-12">
        {/* Profile Sidebar */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {/* Cover image */}
              <div className="h-32 bg-gradient-to-r from-primary/30 to-primary/10 relative">
                <Button 
                  size="icon" 
                  className="absolute bottom-2 right-2 rounded-full shadow-lg opacity-90 hover:opacity-100 h-8 w-8"
                  variant="secondary"
                  onClick={() => alert('Cover photo upload coming soon!')}
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Profile content */}
              <div className="px-6 pb-6 pt-0 -mt-16 flex flex-col items-center">
                <div className="relative mb-4 group">
                  <div className="ring-4 ring-background rounded-full overflow-hidden">
                    <UserAvatar size="xl" className="h-32 w-32 transition-all duration-300 group-hover:scale-105" />
                  </div>
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute inset-0 bg-black/40 rounded-full"></div>
                    <Button 
                      size="icon" 
                      className="relative z-10 rounded-full shadow-lg h-10 w-10 bg-primary hover:bg-primary/90 text-primary-foreground"
                      variant="default"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <span className="animate-spin">·</span> : <Camera className="h-5 w-5" />}
                    </Button>
                    
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleProfileImageUpload}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
                
                <h3 className="text-xl font-semibold mt-2">{currentUser.displayName || "Brave Warrior"}</h3>
                <p className="text-sm text-muted-foreground">{currentUser.email}</p>
                
                <Separator className="my-4" />
                
                <div className="w-full">
                  <div className="flex items-center mb-2">
                    {calculateLevel() < 5 ? (
                      <Shield className="h-5 w-5 mr-2 text-zinc-500" />
                    ) : calculateLevel() < 10 ? (
                      <Award className="h-5 w-5 mr-2 text-amber-500" />
                    ) : (
                      <Shield className="h-5 w-5 mr-2 text-purple-500" />
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">Level {calculateLevel()}</span>
                        <span className="text-muted-foreground">{calculateExperience()}%</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          className={cn(
                            "h-full",
                            calculateLevel() < 5 ? "bg-zinc-500" : 
                            calculateLevel() < 10 ? "bg-amber-500" : 
                            calculateLevel() < 20 ? "bg-orange-500" : 
                            "bg-purple-500"
                          )}
                          initial={{ width: "0%" }}
                          animate={{ width: `${calculateExperience()}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    Warrior for {getAccountAge()} days
                  </p>
                </div>
                
                <Separator className="my-4" />
                
                <div className="w-full grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    Sign out
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="w-full bg-destructive/80 hover:bg-destructive"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main content */}
        <div className="col-span-12 md:col-span-8">
          <Tabs value={profileTab} onValueChange={setProfileTab}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="account" className="flex gap-2 items-center">
                <User className="h-4 w-4" />
                <span>Account</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex gap-2 items-center">
                <Lock className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger value="data" className="flex gap-2 items-center">
                <Database className="h-4 w-4" />
                <span>Data</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              {/* Account Tab */}
              <TabsContent value="account" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Update your account details
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        value={currentUser.email || ""}
                        disabled
                        className="opacity-70"
                      />
                      <p className="text-xs text-muted-foreground">
                        To change your email, please contact support
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline">Cancel</Button>
                    <Button 
                      onClick={handleUpdateProfile}
                      disabled={saving || !displayName}
                      className="flex items-center gap-2"
                    >
                      {saving ? <span className="animate-spin">·</span> : <Save className="h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Details</CardTitle>
                    <CardDescription>
                      View your account information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">User ID</p>
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-xs truncate">{currentUser.uid}</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={() => {
                                navigator.clipboard.writeText(currentUser.uid);
                                toast({ description: "User ID copied to clipboard" });
                              }}
                            >
                              <ClipboardCopy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Email verified</p>
                          <p>{currentUser.emailVerified ? "Yes" : "No"}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Account created</p>
                          <p>{currentUser.metadata.creationTime 
                            ? new Date(currentUser.metadata.creationTime).toLocaleDateString() 
                            : "Unknown"}</p>
                        </div>
                        
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Last sign in</p>
                          <p>{currentUser.metadata.lastSignInTime 
                            ? new Date(currentUser.metadata.lastSignInTime).toLocaleDateString() 
                            : "Unknown"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Security Tab */}
              <TabsContent value="security" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password or recover your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button variant="outline" className="w-full">
                      Send Password Reset Email
                    </Button>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">Delete Account</p>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all your data
                          </p>
                        </div>
                        <Button variant="destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Data Tab */}
              <TabsContent value="data" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>
                      Migrate your local data to the cloud for secure access across devices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {migrationComplete ? (
                      <Alert className="bg-primary/10 text-primary border-primary/20">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                          Your data has been successfully migrated to the cloud
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <>
                        <div className="rounded-lg border bg-card/50 p-4">
                          <h4 className="font-semibold flex items-center mb-2">
                            <Database className="h-4 w-4 mr-2" />
                            Cloud Synchronization
                          </h4>
                          <p className="text-sm">
                            By migrating your data, you'll be able to access your todos, habits, 
                            goals, and other information from any device. Your local data will be 
                            preserved in the cloud.
                          </p>
                        </div>
                        <Button 
                          onClick={handleMigrateData} 
                          disabled={migrating} 
                          className="w-full flex items-center gap-2"
                        >
                          {migrating ? (
                            <>
                              <span className="animate-spin">·</span> 
                              Migrating Data...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4" />
                              Migrate Local Data to Cloud
                            </>
                          )}
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 