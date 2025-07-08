import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Download,
  Filter,
  TrendingUp,
  TrendingDown,
  Wallet,
  Gamepad2,
  Plus,
  Calendar
} from "lucide-react";
import type { Transaction } from "@shared/schema";

export default function Transactions() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [filterType, setFilterType] = useState<string>("all");

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

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/transactions"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen casino-dark flex items-center justify-center">
      <div className="text-casino-gold">Loading...</div>
    </div>;
  }

  const filteredTransactions = transactions?.filter((transaction: Transaction) => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  }) || [];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <TrendingUp className="h-5 w-5 text-casino-green" />;
      case 'bet':
        return <TrendingDown className="h-5 w-5 text-casino-red" />;
      case 'deposit':
        return <Plus className="h-5 w-5 text-blue-400" />;
      case 'withdrawal':
        return <Download className="h-5 w-5 text-orange-400" />;
      default:
        return <Wallet className="h-5 w-5 text-slate-400" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'win':
        return <Badge className="bg-casino-green/20 text-casino-green">Win</Badge>;
      case 'bet':
        return <Badge variant="destructive">Bet</Badge>;
      case 'deposit':
        return <Badge className="bg-blue-500/20 text-blue-400">Deposit</Badge>;
      case 'withdrawal':
        return <Badge className="bg-orange-500/20 text-orange-400">Withdrawal</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatAmount = (amount: string, type: string) => {
    const value = parseFloat(amount);
    const isPositive = value > 0;
    const color = isPositive ? 'text-casino-green' : 'text-casino-red';
    const sign = isPositive && type === 'win' ? '+' : '';
    
    return (
      <span className={`font-bold ${color}`}>
        {sign}${Math.abs(value).toFixed(2)}
      </span>
    );
  };

  const totalDeposits = filteredTransactions
    .filter((t: Transaction) => t.type === 'deposit')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);

  const totalWithdrawals = filteredTransactions
    .filter((t: Transaction) => t.type === 'withdrawal')
    .reduce((sum: number, t: Transaction) => sum + Math.abs(parseFloat(t.amount)), 0);

  const totalWins = filteredTransactions
    .filter((t: Transaction) => t.type === 'win')
    .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount), 0);

  const totalBets = filteredTransactions
    .filter((t: Transaction) => t.type === 'bet')
    .reduce((sum: number, t: Transaction) => sum + Math.abs(parseFloat(t.amount)), 0);

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">Transaction History</h1>
              <p className="text-slate-400 text-lg">View and manage your transaction history</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Total Deposits</h3>
                    <Plus className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    ${totalDeposits.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Total Withdrawals</h3>
                    <Download className="h-4 w-4 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    ${totalWithdrawals.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Total Wins</h3>
                    <TrendingUp className="h-4 w-4 text-casino-green" />
                  </div>
                  <div className="text-2xl font-bold text-casino-green">
                    ${totalWins.toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="casino-card border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-slate-400">Total Bets</h3>
                    <TrendingDown className="h-4 w-4 text-casino-red" />
                  </div>
                  <div className="text-2xl font-bold text-casino-red">
                    ${totalBets.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filters and Table */}
            <Card className="casino-card border-slate-700">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <CardTitle className="text-white">All Transactions</CardTitle>
                  <div className="flex items-center gap-4">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-[180px] bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Filter by type" />
                      </SelectTrigger>
                      <SelectContent className="casino-card border-slate-700">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="deposit">Deposits</SelectItem>
                        <SelectItem value="withdrawal">Withdrawals</SelectItem>
                        <SelectItem value="bet">Bets</SelectItem>
                        <SelectItem value="win">Wins</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="border-slate-600">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {transactionsLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4">
                        <div className="flex items-center space-x-4">
                          <Skeleton className="w-10 h-10 rounded-full" />
                          <div>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                        </div>
                        <Skeleton className="h-4 w-20" />
                      </div>
                    ))}
                  </div>
                ) : filteredTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700">
                        <TableHead className="text-slate-400">Type</TableHead>
                        <TableHead className="text-slate-400">Description</TableHead>
                        <TableHead className="text-slate-400">Amount</TableHead>
                        <TableHead className="text-slate-400">Balance After</TableHead>
                        <TableHead className="text-slate-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.map((transaction: Transaction) => (
                        <TableRow key={transaction.id} className="border-slate-700 hover:bg-slate-700/50">
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {getTransactionIcon(transaction.type)}
                              {getTransactionBadge(transaction.type)}
                            </div>
                          </TableCell>
                          <TableCell className="text-white">
                            {transaction.description || `${transaction.type} transaction`}
                          </TableCell>
                          <TableCell>
                            {formatAmount(transaction.amount, transaction.type)}
                          </TableCell>
                          <TableCell className="text-white font-semibold">
                            ${transaction.balanceAfter}
                          </TableCell>
                          <TableCell className="text-slate-400">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {new Date(transaction.createdAt).toLocaleString()}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-12">
                    <Wallet className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No transactions found</h3>
                    <p className="text-slate-400 mb-4">
                      {filterType === "all" 
                        ? "You haven't made any transactions yet. Start playing to see your transaction history!"
                        : `No ${filterType} transactions found. Try changing the filter.`
                      }
                    </p>
                    <Button className="bg-casino-gold text-casino-dark hover:bg-yellow-500">
                      Start Playing
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
