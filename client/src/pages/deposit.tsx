import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Sidebar from "@/components/Sidebar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useEffect } from "react";

export default function Deposit() {
  const [cardAmount, setCardAmount] = useState<string>('');
  const [cryptoAmount, setCryptoAmount] = useState<string>('');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('bitcoin');
  
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to home if not authenticated
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

  const cryptoOptions = [
    { symbol: 'bitcoin', name: 'Bitcoin', icon: '₿', address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' },
    { symbol: 'ethereum', name: 'Ethereum', icon: 'Ξ', address: '0x742d35Cc663a08b7B1b4b6C4c2a6e7D9A8F9B3E2' },
    { symbol: 'usdt', name: 'Tether (USDT)', icon: '₮', address: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' },
    { symbol: 'usdc', name: 'USD Coin', icon: '$', address: '0xA0b86a33E6417efE7FB9a3d4F8E6F0C7B8C9D4E5' },
    { symbol: 'bnb', name: 'Binance Coin', icon: 'BNB', address: 'bnb1234567890abcdef1234567890abcdef12345678' },
    { symbol: 'ltc', name: 'Litecoin', icon: 'Ł', address: 'LTC1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4' }
  ];

  const cardDepositMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/payments/create-payment-intent", {
        amount: parseFloat(cardAmount),
        type: 'deposit'
      });
    },
    onSuccess: (data) => {
      // Redirect to Stripe checkout or handle payment
      toast({
        title: "Payment Processing",
        description: "Redirecting to secure payment page...",
      });
      // In real implementation, redirect to Stripe checkout
    },
    onError: (error: Error) => {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const cryptoDepositMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/payments/crypto-deposit", {
        amount: parseFloat(cryptoAmount),
        cryptocurrency: selectedCrypto,
        address: cryptoOptions.find(c => c.symbol === selectedCrypto)?.address
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Crypto Deposit Initiated",
        description: `Send ${cryptoAmount} ${selectedCrypto.toUpperCase()} to the provided address`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen casino-dark flex items-center justify-center">
        <div className="text-casino-gold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen casino-dark text-white">
      <Navigation />
      
      <div className="flex">
        <Sidebar />
        
        <main className="flex-1 lg:pl-64">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-4">💰 Deposit Funds</h1>
              <p className="text-slate-400">Add money to your account using cryptocurrency or credit/debit cards</p>
            </div>

            <Tabs defaultValue="crypto" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="crypto" className="text-lg py-3">
                  🪙 Cryptocurrency
                </TabsTrigger>
                <TabsTrigger value="card" className="text-lg py-3">
                  💳 Credit/Debit Card
                </TabsTrigger>
              </TabsList>

              {/* Cryptocurrency Deposit */}
              <TabsContent value="crypto" className="space-y-6">
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-2xl casino-gold flex items-center gap-2">
                      🪙 Cryptocurrency Deposit
                    </CardTitle>
                    <p className="text-slate-400">
                      Instant deposits with low fees. Most popular cryptocurrencies accepted.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Crypto Selection */}
                    <div className="space-y-4">
                      <Label className="text-lg text-white">Select Cryptocurrency</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {cryptoOptions.map((crypto) => (
                          <Button
                            key={crypto.symbol}
                            variant={selectedCrypto === crypto.symbol ? "default" : "outline"}
                            className={`p-4 h-auto ${
                              selectedCrypto === crypto.symbol 
                                ? "bg-casino-gold text-casino-dark" 
                                : "border-slate-600 text-white hover:bg-slate-700"
                            }`}
                            onClick={() => setSelectedCrypto(crypto.symbol)}
                          >
                            <div className="text-center">
                              <div className="text-2xl mb-1">{crypto.icon}</div>
                              <div className="text-sm">{crypto.name}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="cryptoAmount" className="text-lg text-white">
                        Amount ({selectedCrypto.toUpperCase()})
                      </Label>
                      <Input
                        id="cryptoAmount"
                        type="number"
                        step="0.00000001"
                        min="0"
                        value={cryptoAmount}
                        onChange={(e) => setCryptoAmount(e.target.value)}
                        placeholder={`Enter ${selectedCrypto.toUpperCase()} amount`}
                        className="text-lg p-3 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>

                    {/* Deposit Address */}
                    {selectedCrypto && (
                      <div className="space-y-2">
                        <Label className="text-lg text-white">Deposit Address</Label>
                        <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                          <div className="flex justify-between items-center">
                            <code className="text-green-400 text-sm break-all">
                              {cryptoOptions.find(c => c.symbol === selectedCrypto)?.address}
                            </code>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  cryptoOptions.find(c => c.symbol === selectedCrypto)?.address || ''
                                );
                                toast({
                                  title: "Address Copied",
                                  description: "Deposit address copied to clipboard",
                                });
                              }}
                            >
                              Copy
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-slate-400">
                          Send your {selectedCrypto.toUpperCase()} to this address. Funds will be credited after network confirmation.
                        </p>
                      </div>
                    )}

                    {/* Processing Info */}
                    <div className="bg-blue-900/20 border border-blue-600 p-4 rounded-lg">
                      <h4 className="text-blue-400 font-medium mb-2">Processing Information</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Minimum deposit: 0.001 {selectedCrypto.toUpperCase()}</li>
                        <li>• Network fee: Paid by sender</li>
                        <li>• Processing time: 1-6 network confirmations</li>
                        <li>• Funds available immediately after confirmation</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => cryptoDepositMutation.mutate()}
                      disabled={!cryptoAmount || cryptoDepositMutation.isPending}
                      className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500 text-lg py-3"
                    >
                      {cryptoDepositMutation.isPending ? "Processing..." : "Generate Deposit"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Card Deposit */}
              <TabsContent value="card" className="space-y-6">
                <Card className="casino-card border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-2xl casino-gold flex items-center gap-2">
                      💳 Credit/Debit Card Deposit
                    </CardTitle>
                    <p className="text-slate-400">
                      Instant deposits using Visa, Mastercard, or American Express. Secured by Stripe.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Amount Input */}
                    <div className="space-y-2">
                      <Label htmlFor="cardAmount" className="text-lg text-white">
                        Amount (USD)
                      </Label>
                      <Input
                        id="cardAmount"
                        type="number"
                        step="0.01"
                        min="10"
                        max="10000"
                        value={cardAmount}
                        onChange={(e) => setCardAmount(e.target.value)}
                        placeholder="Enter amount in USD"
                        className="text-lg p-3 bg-slate-800 border-slate-600 text-white"
                      />
                      <p className="text-sm text-slate-400">
                        Minimum: $10.00 • Maximum: $10,000.00 per transaction
                      </p>
                    </div>

                    {/* Accepted Cards */}
                    <div className="space-y-2">
                      <Label className="text-lg text-white">Accepted Cards</Label>
                      <div className="flex gap-3">
                        <Badge variant="outline" className="border-slate-600 text-white">
                          💳 Visa
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-white">
                          💳 Mastercard
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-white">
                          💳 Amex
                        </Badge>
                        <Badge variant="outline" className="border-slate-600 text-white">
                          💳 Discover
                        </Badge>
                      </div>
                    </div>

                    {/* Security Info */}
                    <div className="bg-green-900/20 border border-green-600 p-4 rounded-lg">
                      <h4 className="text-green-400 font-medium mb-2">🔒 Security & Privacy</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• PCI DSS compliant payment processing</li>
                        <li>• 256-bit SSL encryption</li>
                        <li>• No card details stored on our servers</li>
                        <li>• Powered by Stripe for maximum security</li>
                      </ul>
                    </div>

                    {/* Fees */}
                    <div className="bg-yellow-900/20 border border-yellow-600 p-4 rounded-lg">
                      <h4 className="text-yellow-400 font-medium mb-2">💰 Fees & Processing</h4>
                      <ul className="text-sm text-slate-300 space-y-1">
                        <li>• Processing fee: 2.9% + $0.30</li>
                        <li>• Instant deposit to your casino balance</li>
                        <li>• Available for play immediately</li>
                        <li>• 24/7 customer support</li>
                      </ul>
                    </div>

                    <Button
                      onClick={() => cardDepositMutation.mutate()}
                      disabled={!cardAmount || parseFloat(cardAmount) < 10 || cardDepositMutation.isPending}
                      className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500 text-lg py-3"
                    >
                      {cardDepositMutation.isPending ? "Processing..." : `Deposit $${cardAmount || '0.00'}`}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Recent Deposits */}
            <Card className="casino-card border-slate-700 mt-8">
              <CardHeader>
                <CardTitle className="text-xl text-white">Recent Deposits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-slate-400 py-8">
                  No recent deposits. Start by making your first deposit above.
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}