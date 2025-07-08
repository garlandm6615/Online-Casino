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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Shield,
  Users,
  Gamepad2,
  Plus,
  Edit,
  Crown,
  Calendar,
  DollarSign,
  TrendingUp,
  Settings,
  User
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { User as UserType, Game } from "@shared/schema";

export default function Admin() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'games' | 'stats'>('users');
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [gameForm, setGameForm] = useState({
    name: "",
    type: "",
    minBet: "",
    maxBet: "",
    rtp: "",
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

  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: isAuthenticated,
  }) as { data: UserType | undefined, isLoading: boolean };

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && currentUser?.isAdmin,
  });

  const { data: games, isLoading: gamesLoading } = useQuery({
    queryKey: ["/api/games"],
    enabled: isAuthenticated,
  });

  const createGameMutation = useMutation({
    mutationFn: async (data: typeof gameForm) => {
      const response = await apiRequest(
        "POST",
        "/api/admin/games",
        data
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Game created successfully!",
      });
      setIsCreateGameOpen(false);
      setGameForm({ name: "", type: "", minBet: "", maxBet: "", rtp: "" });
      queryClient.invalidateQueries({ queryKey: ["/api/games"] });
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
        description: error.message || "Failed to create game",
        variant: "destructive",
      });
    },
  });

  // Check if user is admin
  useEffect(() => {
    if (!userLoading && currentUser && !currentUser.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin panel.",
        variant: "destructive",
      });
      // Redirect to home page
      window.location.href = "/";
    }
  }, [currentUser, userLoading, toast]);

  if (isLoading || userLoading || !isAuthenticated) {
    return <div className="min-h-screen casino-dark flex items-center justify-center">
      <div className="text-casino-gold">Loading...</div>
    </div>;
  }

  if (!currentUser?.isAdmin) {
    return <div className="min-h-screen casino-dark flex items-center justify-center">
      <div className="text-center">
        <Shield className="mx-auto h-16 w-16 text-red-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-slate-400">You don't have permission to access this page.</p>
      </div>
    </div>;
  }

  const handleCreateGame = () => {
    createGameMutation.mutate(gameForm);
  };

  const totalUsers = users?.length || 0;
  const totalGames = games?.length || 0;
  const activeGames = games?.filter((game: Game) => game.isActive).length || 0;

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4 flex items-center">
                <Shield className="mr-3 h-8 w-8 text-purple-400" />
                Admin Panel
              </h1>
              <p className="text-slate-400 text-lg">Manage users, games, and system settings</p>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Users</p>
                      <p className="text-2xl font-bold text-white">{totalUsers}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Total Games</p>
                      <p className="text-2xl font-bold text-white">{totalGames}</p>
                    </div>
                    <Gamepad2 className="h-8 w-8 text-casino-gold" />
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">Active Games</p>
                      <p className="text-2xl font-bold text-white">{activeGames}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-casino-green" />
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">System Status</p>
                      <p className="text-2xl font-bold casino-green">Online</p>
                    </div>
                    <Settings className="h-8 w-8 text-slate-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Navigation Tabs */}
            <div className="flex space-x-1 mb-6">
              <Button
                variant={activeTab === 'users' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('users')}
                className={activeTab === 'users' ? 'bg-casino-gold text-casino-dark' : ''}
              >
                <Users className="mr-2 h-4 w-4" />
                Users
              </Button>
              <Button
                variant={activeTab === 'games' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('games')}
                className={activeTab === 'games' ? 'bg-casino-gold text-casino-dark' : ''}
              >
                <Gamepad2 className="mr-2 h-4 w-4" />
                Games
              </Button>
              <Button
                variant={activeTab === 'stats' ? 'default' : 'ghost'}
                onClick={() => setActiveTab('stats')}
                className={activeTab === 'stats' ? 'bg-casino-gold text-casino-dark' : ''}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Statistics
              </Button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
              <Card className="casino-card border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">User Management</CardTitle>
                </CardHeader>
                <CardContent>
                  {usersLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                          <div className="flex items-center space-x-4">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div>
                              <Skeleton className="h-4 w-32 mb-2" />
                              <Skeleton className="h-3 w-24" />
                            </div>
                          </div>
                          <Skeleton className="h-6 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : users && users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400">User</TableHead>
                          <TableHead className="text-slate-400">Email</TableHead>
                          <TableHead className="text-slate-400">Balance</TableHead>
                          <TableHead className="text-slate-400">Role</TableHead>
                          <TableHead className="text-slate-400">Joined</TableHead>
                          <TableHead className="text-slate-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((user: UserType) => (
                          <TableRow key={user.id} className="border-slate-700">
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-casino-gold to-yellow-600 rounded-full flex items-center justify-center">
                                  {user.profileImageUrl ? (
                                    <img
                                      src={user.profileImageUrl}
                                      alt="Profile"
                                      className="w-10 h-10 rounded-full object-cover"
                                    />
                                  ) : (
                                    <User className="h-5 w-5 text-casino-dark" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {user.firstName && user.lastName 
                                      ? `${user.firstName} ${user.lastName}`
                                      : user.email?.split('@')[0] || 'User'
                                    }
                                  </p>
                                  <p className="text-slate-400 text-sm">ID: {user.id}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-white">{user.email}</TableCell>
                            <TableCell className="text-casino-gold font-semibold">${user.balance}</TableCell>
                            <TableCell>
                              {user.isAdmin ? (
                                <Badge className="bg-purple-600">
                                  <Crown className="mr-1 h-3 w-3" />
                                  Admin
                                </Badge>
                              ) : (
                                <Badge variant="outline">Player</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-slate-400">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="border-slate-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No users found.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Games Tab */}
            {activeTab === 'games' && (
              <Card className="casino-card border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-white">Game Management</CardTitle>
                    <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-casino-gold text-casino-dark hover:bg-yellow-500">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Game
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="casino-card border-slate-700">
                        <DialogHeader>
                          <DialogTitle className="text-white">Create New Game</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="gameName" className="text-slate-400">Game Name</Label>
                            <Input
                              id="gameName"
                              value={gameForm.name}
                              onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="Enter game name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="gameType" className="text-slate-400">Game Type</Label>
                            <Select value={gameForm.type} onValueChange={(value) => setGameForm(prev => ({ ...prev, type: value }))}>
                              <SelectTrigger className="bg-slate-700 border-slate-600">
                                <SelectValue placeholder="Select game type" />
                              </SelectTrigger>
                              <SelectContent className="casino-card border-slate-700">
                                <SelectItem value="slots">Slots</SelectItem>
                                <SelectItem value="blackjack">Blackjack</SelectItem>
                                <SelectItem value="roulette">Roulette</SelectItem>
                                <SelectItem value="poker">Poker</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="minBet" className="text-slate-400">Min Bet</Label>
                              <Input
                                id="minBet"
                                type="number"
                                step="0.01"
                                value={gameForm.minBet}
                                onChange={(e) => setGameForm(prev => ({ ...prev, minBet: e.target.value }))}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="0.00"
                              />
                            </div>
                            <div>
                              <Label htmlFor="maxBet" className="text-slate-400">Max Bet</Label>
                              <Input
                                id="maxBet"
                                type="number"
                                step="0.01"
                                value={gameForm.maxBet}
                                onChange={(e) => setGameForm(prev => ({ ...prev, maxBet: e.target.value }))}
                                className="bg-slate-700 border-slate-600 text-white"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="rtp" className="text-slate-400">RTP (%)</Label>
                            <Input
                              id="rtp"
                              type="number"
                              step="0.01"
                              value={gameForm.rtp}
                              onChange={(e) => setGameForm(prev => ({ ...prev, rtp: e.target.value }))}
                              className="bg-slate-700 border-slate-600 text-white"
                              placeholder="96.00"
                            />
                          </div>
                          <Button
                            onClick={handleCreateGame}
                            disabled={createGameMutation.isPending}
                            className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500"
                          >
                            {createGameMutation.isPending ? "Creating..." : "Create Game"}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  {gamesLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between p-4">
                          <Skeleton className="h-16 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : games && games.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-slate-400">Game</TableHead>
                          <TableHead className="text-slate-400">Type</TableHead>
                          <TableHead className="text-slate-400">Min/Max Bet</TableHead>
                          <TableHead className="text-slate-400">RTP</TableHead>
                          <TableHead className="text-slate-400">Status</TableHead>
                          <TableHead className="text-slate-400">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {games.map((game: Game) => (
                          <TableRow key={game.id} className="border-slate-700">
                            <TableCell className="text-white font-medium">{game.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {game.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-400">
                              ${game.minBet} - ${game.maxBet}
                            </TableCell>
                            <TableCell className="text-casino-green font-semibold">
                              {game.rtp}%
                            </TableCell>
                            <TableCell>
                              <Badge className={game.isActive ? "bg-casino-green" : "bg-slate-600"}>
                                {game.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="outline" size="sm" className="border-slate-600">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8 text-slate-400">
                      No games found.
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Statistics Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-6">
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">System Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-6 bg-slate-700 rounded-lg">
                        <DollarSign className="mx-auto h-8 w-8 text-casino-gold mb-2" />
                        <div className="text-2xl font-bold text-white mb-1">$0.00</div>
                        <div className="text-sm text-slate-400">Total Revenue</div>
                      </div>
                      <div className="text-center p-6 bg-slate-700 rounded-lg">
                        <TrendingUp className="mx-auto h-8 w-8 text-casino-green mb-2" />
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-sm text-slate-400">Games Played Today</div>
                      </div>
                      <div className="text-center p-6 bg-slate-700 rounded-lg">
                        <Users className="mx-auto h-8 w-8 text-blue-400 mb-2" />
                        <div className="text-2xl font-bold text-white mb-1">0</div>
                        <div className="text-sm text-slate-400">Active Players</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-slate-400">
                      No recent activity data available.
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
