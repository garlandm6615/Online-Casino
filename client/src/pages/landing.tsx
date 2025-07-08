import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Play, Gift, Star, Shield, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen casino-dark text-white">
      {/* Navigation */}
      <nav className="casino-card border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Crown className="text-casino-gold h-8 w-8" />
              <span className="text-xl font-bold casino-gold">Royal Casino</span>
            </div>
            <Button onClick={handleLogin} className="bg-casino-gold text-casino-dark hover:bg-yellow-500">
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-casino-dark via-slate-800 to-casino-card"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Welcome to </span>
              <span className="casino-gold">Royal Casino</span>
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of Las Vegas from anywhere. Play slots, blackjack, roulette, and more with fair gaming and instant payouts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={handleLogin}
                size="lg"
                className="bg-casino-gold text-casino-dark hover:bg-yellow-500 transform hover:scale-105 transition-all"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Playing Now
              </Button>
              <Button 
                variant="outline"
                size="lg"
                className="border-casino-gold casino-gold hover:bg-casino-gold hover:text-casino-dark"
              >
                <Gift className="mr-2 h-5 w-5" />
                Claim Bonus
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Why Choose Royal Casino?</h2>
            <p className="text-slate-400 text-lg">The ultimate gaming experience with unmatched benefits</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="casino-card border-slate-700 hover:border-casino-gold transition-colors">
              <CardContent className="p-6 text-center">
                <Shield className="h-12 w-12 casino-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Secure & Licensed</h3>
                <p className="text-slate-400">Licensed and regulated with bank-level security to protect your funds and data.</p>
              </CardContent>
            </Card>

            <Card className="casino-card border-slate-700 hover:border-casino-gold transition-colors">
              <CardContent className="p-6 text-center">
                <Zap className="h-12 w-12 casino-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Instant Payouts</h3>
                <p className="text-slate-400">Lightning-fast withdrawals with multiple payment methods for your convenience.</p>
              </CardContent>
            </Card>

            <Card className="casino-card border-slate-700 hover:border-casino-gold transition-colors">
              <CardContent className="p-6 text-center">
                <Star className="h-12 w-12 casino-gold mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Premium Games</h3>
                <p className="text-slate-400">Hundreds of games from top providers with high RTPs and exciting features.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Game Preview */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Featured Games</h2>
            <p className="text-slate-400 text-lg">Choose from our premium selection of casino games</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Slots */}
            <Card className="casino-card border-slate-700 overflow-hidden hover:transform hover:scale-105 transition-all">
              <div className="h-48 bg-gradient-to-br from-casino-gold via-yellow-600 to-orange-600 flex items-center justify-center relative">
                <div className="text-6xl">🎰</div>
                <div className="absolute top-4 right-4 bg-casino-green text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Hot
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Golden Reels</h3>
                <p className="text-slate-400 mb-4">Progressive jackpot slots with mega wins</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">Min Bet: $0.10</span>
                  <span className="casino-gold font-semibold">RTP: 96.5%</span>
                </div>
                <Button onClick={handleLogin} className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                  Play Now
                </Button>
              </CardContent>
            </Card>

            {/* Blackjack */}
            <Card className="casino-card border-slate-700 overflow-hidden hover:transform hover:scale-105 transition-all">
              <div className="h-48 bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 flex items-center justify-center relative">
                <div className="text-6xl">🃏</div>
                <div className="absolute top-4 right-4 bg-casino-red text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Live
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Classic Blackjack</h3>
                <p className="text-slate-400 mb-4">Beat the dealer with perfect strategy</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">Min Bet: $5</span>
                  <span className="casino-green font-semibold">RTP: 99.5%</span>
                </div>
                <Button onClick={handleLogin} className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                  Play Now
                </Button>
              </CardContent>
            </Card>

            {/* Roulette */}
            <Card className="casino-card border-slate-700 overflow-hidden hover:transform hover:scale-105 transition-all">
              <div className="h-48 bg-gradient-to-br from-red-800 via-red-700 to-red-900 flex items-center justify-center relative">
                <div className="text-6xl">🎯</div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Popular
                </div>
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">European Roulette</h3>
                <p className="text-slate-400 mb-4">Spin the wheel and hit your lucky number</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-slate-500">Min Bet: $1</span>
                  <span className="casino-green font-semibold">Max Win: 35:1</span>
                </div>
                <Button onClick={handleLogin} className="w-full bg-casino-gold text-casino-dark hover:bg-yellow-500">
                  Play Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Win Big?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Join thousands of players and start your winning journey today!
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-casino-gold text-casino-dark hover:bg-yellow-500 transform hover:scale-105 transition-all"
          >
            <Crown className="mr-2 h-5 w-5" />
            Join Royal Casino
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="casino-card border-t border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Crown className="casino-gold h-6 w-6" />
              <span className="text-lg font-bold casino-gold">Royal Casino</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2024 Royal Casino. All rights reserved. | 18+ Only | Gamble Responsibly
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
