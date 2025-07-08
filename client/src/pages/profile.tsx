import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Mail, 
  Calendar, 
  Settings, 
  Shield, 
  Crown,
  Edit3,
  Save,
  X
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User as UserType } from "@shared/schema";

export default function Profile() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  }) as { data: UserType | undefined, isLoading: boolean };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (user && !isEditing) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user, isEditing]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof editForm) => {
      const response = await apiRequest(
        "PATCH",
        "/api/auth/user",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateProfileMutation.mutate(editForm);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen casino-dark flex items-center justify-center">
      <div className="text-casino-gold">Loading...</div>
    </div>;
  }

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Profile Settings</h1>
              <p className="text-slate-400 text-lg">Manage your account information and preferences</p>
            </div>

            <div className="space-y-6">
              {/* Profile Overview */}
              <Card className="casino-card border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <User className="mr-2 h-5 w-5" />
                      Profile Information
                    </CardTitle>
                    {!isEditing ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(true)}
                        className="border-slate-600"
                      >
                        <Edit3 className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-casino-green hover:bg-green-600"
                        >
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancel}
                          className="border-slate-600"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Picture and Basic Info */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      {userLoading ? (
                        <Skeleton className="w-20 h-20 rounded-full" />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-casino-gold to-yellow-600 flex items-center justify-center">
                          {user?.profileImageUrl ? (
                            <img
                              src={user.profileImageUrl}
                              alt="Profile"
                              className="w-20 h-20 rounded-full object-cover border-2 border-casino-gold"
                            />
                          ) : (
                            <User className="h-10 w-10 text-casino-dark" />
                          )}
                        </div>
                      )}
                      {user?.isAdmin && (
                        <div className="absolute -top-1 -right-1">
                          <Badge className="bg-purple-600 text-white text-xs px-1 py-0">
                            <Crown className="h-3 w-3" />
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      {userLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64" />
                        </div>
                      ) : (
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {user?.firstName && user?.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : user?.email?.split('@')[0] || 'User'
                            }
                          </h3>
                          <p className="text-slate-400">{user?.email}</p>
                          {user?.isAdmin && (
                            <Badge className="mt-2 bg-purple-600">
                              <Shield className="mr-1 h-3 w-3" />
                              Administrator
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="border-slate-700" />

                  {/* Editable Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-slate-400">First Name</Label>
                      {isEditing ? (
                        <Input
                          id="firstName"
                          value={editForm.firstName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Enter your first name"
                        />
                      ) : (
                        <div className="text-white p-3 bg-slate-700 rounded-md">
                          {user?.firstName || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-slate-400">Last Name</Label>
                      {isEditing ? (
                        <Input
                          id="lastName"
                          value={editForm.lastName}
                          onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Enter your last name"
                        />
                      ) : (
                        <div className="text-white p-3 bg-slate-700 rounded-md">
                          {user?.lastName || "Not provided"}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="text-slate-400">Email Address</Label>
                      <div className="text-white p-3 bg-slate-700 rounded-md flex items-center">
                        <Mail className="mr-2 h-4 w-4 text-slate-400" />
                        {user?.email || "Not provided"}
                      </div>
                      <p className="text-xs text-slate-500">Email cannot be changed directly. Contact support if needed.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Statistics */}
              <Card className="casino-card border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Account Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold casino-gold mb-1">
                        {userLoading ? <Skeleton className="h-8 w-20 mx-auto" /> : `$${user?.balance || "0.00"}`}
                      </div>
                      <div className="text-sm text-slate-400">Current Balance</div>
                    </div>

                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-white mb-1">
                        {statsLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : stats?.totalGames || 0}
                      </div>
                      <div className="text-sm text-slate-400">Games Played</div>
                    </div>

                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold casino-green mb-1">
                        {userLoading ? <Skeleton className="h-8 w-20 mx-auto" /> : `$${user?.biggestWin || "0.00"}`}
                      </div>
                      <div className="text-sm text-slate-400">Biggest Win</div>
                    </div>

                    <div className="text-center p-4 bg-slate-700 rounded-lg">
                      <div className="text-2xl font-bold text-white mb-1">
                        {statsLoading ? <Skeleton className="h-8 w-16 mx-auto" /> : `${stats?.winRate || 0}%`}
                      </div>
                      <div className="text-sm text-slate-400">Win Rate</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Details */}
              <Card className="casino-card border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Calendar className="mr-2 h-5 w-5" />
                    Account Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Member Since</span>
                    <span className="text-white">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Last Updated</span>
                    <span className="text-white">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Account Status</span>
                    <Badge className="bg-casino-green">Active</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Account Type</span>
                    <span className="text-white">
                      {user?.isAdmin ? "Administrator" : "Regular Player"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Danger Zone */}
              <Card className="casino-card border-red-700">
                <CardHeader>
                  <CardTitle className="text-red-400">Danger Zone</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-medium">Log Out</h4>
                      <p className="text-slate-400 text-sm">Sign out of your account on this device</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => window.location.href = "/api/logout"}
                    >
                      Log Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
