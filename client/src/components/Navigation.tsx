import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Crown, Wallet, Plus, User, LogOut, Menu } from "lucide-react";
import { Link } from "wouter";
import type { User as UserType } from "@shared/schema";

export default function Navigation() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  }) as { data: UserType | undefined };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <nav className="casino-card border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Crown className="casino-gold h-8 w-8" />
              <span className="text-xl font-bold casino-gold">Royal Casino</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className="text-white hover:text-casino-gold transition-colors px-3 py-2 rounded-md font-medium">
                Games
              </a>
            </Link>
            <a href="#promotions" className="text-slate-300 hover:text-casino-gold transition-colors px-3 py-2 rounded-md font-medium">
              Promotions
            </a>
            <a href="#tournaments" className="text-slate-300 hover:text-casino-gold transition-colors px-3 py-2 rounded-md font-medium">
              Tournaments
            </a>
            <a href="#vip" className="text-slate-300 hover:text-casino-gold transition-colors px-3 py-2 rounded-md font-medium">
              VIP Club
            </a>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Balance Display */}
            {userData && (
              <div className="bg-slate-700 px-4 py-2 rounded-lg flex items-center space-x-2">
                <Wallet className="casino-gold h-4 w-4" />
                <span className="font-semibold">${userData.balance}</span>
              </div>
            )}

            {/* Deposit Button */}
            <Button className="bg-casino-gold text-casino-dark hover:bg-yellow-500">
              <Plus className="mr-2 h-4 w-4" />
              Deposit
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  {userData?.profileImageUrl ? (
                    <img
                      src={userData.profileImageUrl}
                      alt="Profile"
                      className="h-10 w-10 rounded-full object-cover border-2 border-casino-gold"
                    />
                  ) : (
                    <User className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 casino-card border-slate-700" align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <Crown className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/transactions">
                    <Wallet className="mr-2 h-4 w-4" />
                    Transactions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-slate-700">
              <Link href="/">
                <a className="text-white hover:text-casino-gold block px-3 py-2 rounded-md text-base font-medium">
                  Games
                </a>
              </Link>
              <a href="#promotions" className="text-slate-300 hover:text-casino-gold block px-3 py-2 rounded-md text-base font-medium">
                Promotions
              </a>
              <a href="#tournaments" className="text-slate-300 hover:text-casino-gold block px-3 py-2 rounded-md text-base font-medium">
                Tournaments
              </a>
              <a href="#vip" className="text-slate-300 hover:text-casino-gold block px-3 py-2 rounded-md text-base font-medium">
                VIP Club
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
