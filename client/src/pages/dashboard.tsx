import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Wallet, 
  Gamepad2, 
  Star, 
  TrendingUp, 
  Plus, 
  Download, 
  History,
  Trophy,
  Target,
  Award
} from "lucide-react";
import type { User } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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
  }) as { data: User | undefined, isLoading: boolean };

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users/stats"],
    enabled: isAuthenticated,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Your Gaming Dashboard</h1>
              <p className="text-slate-400 text-lg">Track your progress and manage your account</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Account Overview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="casino-card border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Total Balance</h3>
                        <Wallet className="casino-gold h-6 w-6" />
                      </div>
                      {userLoading ? (
                        <Skeleton className="h-8 w-24 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold casino-gold mb-2">
                          ${user?.balance || "0.00"}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <TrendingUp className="casino-green h-4 w-4 mr-1" />
                        <span className="casino-green">Available</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="casino-card border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Games Played</h3>
                        <Gamepad2 className="text-blue-400 h-6 w-6" />
                      </div>
                      {statsLoading ? (
                        <Skeleton className="h-8 w-16 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold text-white mb-2">
                          {stats?.totalGames || 0}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <Trophy className="casino-gold h-4 w-4 mr-1" />
                        <span className="text-white">
                          {stats?.winRate || 0}% win rate
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="casino-card border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Biggest Win</h3>
                        <Star className="casino-gold h-6 w-6" />
                      </div>
                      {userLoading ? (
                        <Skeleton className="h-8 w-20 mb-2" />
                      ) : (
                        <div className="text-3xl font-bold casino-green mb-2">
                          ${user?.biggestWin || "0.00"}
                        </div>
                      )}
                      <div className="flex items-center text-sm">
                        <span className="text-slate-400">Personal best</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactionsLoading ? (
                      <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <Skeleton className="w-10 h-10 rounded-full" />
                              <div>
                                <Skeleton className="h-4 w-32 mb-1" />
                                <Skeleton className="h-3 w-20" />
                              </div>
                            </div>
                            <Skeleton className="h-4 w-16" />
                          </div>
                        ))}
                      </div>
                    ) : transactions && transactions.length > 0 ? (
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction: any) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 bg-slate-700 rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                transaction.type === 'win' ? 'bg-casino-green' : 
                                transaction.type === 'bet' ? 'bg-casino-red' : 'bg-blue-600'
                              }`}>
                                {transaction.type === 'win' ? (
                                  <Plus className="text-white h-5 w-5" />
                                ) : transaction.type === 'bet' ? (
                                  <Gamepad2 className="text-white h-5 w-5" />
                                ) : (
                                  <Wallet className="text-white h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="text-white font-medium">
                                  {transaction.description || `${transaction.type} transaction`}
                                </p>
                                <p className="text-slate-400 text-sm">
                                  {new Date(transaction.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className={`font-bold ${
                              parseFloat(transaction.amount) > 0 ? 'casino-green' : 'text-slate-400'
                            }`}>
                              {parseFloat(transaction.amount) > 0 ? '+' : ''}${transaction.amount}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-8">
                        No recent activity found. Start playing to see your transaction history!
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Achievements */}
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Achievements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                      <Trophy className="text-casino-gold h-6 w-6" />
                      <div>
                        <p className="text-white font-medium text-sm">Welcome Player</p>
                        <p className="text-slate-400 text-xs">Join Royal Casino</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg">
                      <Target className="text-blue-400 h-6 w-6" />
                      <div>
                        <p className="text-white font-medium text-sm">First Spin</p>
                        <p className="text-slate-400 text-xs">Play your first slot game</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg opacity-50">
                      <Award className="text-slate-500 h-6 w-6" />
                      <div>
                        <p className="text-slate-500 font-medium text-sm">High Roller</p>
                        <p className="text-slate-500 text-xs">Bet over $100 in one game</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Funds
                    </Button>
                    <Button className="w-full bg-slate-700 text-white hover:bg-slate-600">
                      <Download className="mr-2 h-4 w-4" />
                      Withdraw
                    </Button>
                    <Button className="w-full bg-slate-700 text-white hover:bg-slate-600">
                      <History className="mr-2 h-4 w-4" />
                      View History
                    </Button>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card className="bg-gradient-to-br from-blue-600 to-purple-700 text-white border-0">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-3">Need Help?</h3>
                    <p className="text-blue-100 text-sm mb-4">
                      Our support team is available 24/7 to assist you.
                    </p>
                    <Button className="w-full bg-white text-blue-600 hover:bg-blue-50">
                      Live Chat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
