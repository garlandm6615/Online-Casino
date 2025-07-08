import { Link, useLocation } from "wouter";
import { 
  Dice1, 
  Spade, 
  Target, 
  Heart, 
  TrendingUp, 
  History, 
  User, 
  HelpCircle, 
  MessageSquare,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import type { User as UserType } from "@shared/schema";

const navigation = [
  {
    name: "Quick Play",
    items: [
      { name: "Slot Machines", href: "/slots", icon: Dice1, current: false },
      { name: "Blackjack", href: "/blackjack", icon: Spade, current: false },
      { name: "Roulette", href: "/roulette", icon: Target, current: false },
      { name: "Texas Hold'em", href: "/poker", icon: Heart, current: false },
    ]
  },
  {
    name: "Account",
    items: [
      { name: "Dashboard", href: "/dashboard", icon: TrendingUp, current: false },
      { name: "Transactions", href: "/transactions", icon: History, current: false },
      { name: "Profile", href: "/profile", icon: User, current: false },
    ]
  },
  {
    name: "Support",
    items: [
      { name: "Help Center", href: "/help", icon: HelpCircle, current: false },
      { name: "Live Chat", href: "/contact", icon: MessageSquare, current: false },
    ]
  }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const { data: userData } = useQuery({
    queryKey: ["/api/auth/user"],
    enabled: !!user,
  }) as { data: UserType | undefined };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-16 lg:z-50 casino-card border-r border-slate-700">
      <div className="flex-1 flex flex-col min-h-0 pt-5 pb-4 overflow-y-auto">
        <div className="flex-1 px-3 space-y-1">
          {navigation.map((section) => (
            <div key={section.name} className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                {section.name}
              </h3>
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  
                  return (
                    <Link key={item.name} href={item.href}>
                      <a className={cn(
                        "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-slate-700 casino-gold"
                          : "text-slate-300 hover:bg-slate-700 hover:text-white"
                      )}>
                        <Icon className={cn(
                          "mr-3 h-4 w-4",
                          isActive ? "casino-gold" : "text-slate-400"
                        )} />
                        {item.name}
                      </a>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Admin Section - Only show for admins */}
          {userData?.isAdmin && (
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Administration
              </h3>
              <div className="space-y-2">
                <Link href="/admin">
                  <a className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    location === "/admin"
                      ? "bg-slate-700 casino-gold"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  )}>
                    <Shield className={cn(
                      "mr-3 h-4 w-4",
                      location === "/admin" ? "casino-gold" : "text-slate-400"
                    )} />
                    Admin Panel
                  </a>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
