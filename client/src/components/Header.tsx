import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseAuth } from "@/components/SupabaseAuthProvider";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import HelpForm from "@/components/HelpForm";
import { Leaf, Sun, Moon, MessageSquare, ChevronDown, User, Settings, LogOut, HelpCircle, Info, BarChart3 } from "lucide-react";

interface HeaderProps {
  onChatToggle: () => void;
  onDashboardToggle?: () => void;
}

export default function Header({ onChatToggle, onDashboardToggle }: HeaderProps) {
  const { user } = useAuth();
  const { signOut } = useSupabaseAuth();
  const { theme, toggleTheme } = useTheme();
  const [showHelpForm, setShowHelpForm] = useState(false);

  const handleLogout = async () => {
    await signOut();
  };

  const handleHelpClick = () => {
    setShowHelpForm(true);
  };


  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">InfraVision</h1>
              <p className="text-xs text-muted-foreground">Green Hydrogen Planning</p>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center space-x-4">
            
            <nav className="hidden md:flex items-center space-x-6">
              {onDashboardToggle && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={onDashboardToggle}
                  data-testid="button-dashboard-nav"
                >
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </Button>
              )}
              
              <Link href="/about">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Info className="w-4 h-4" />
                  About
                </Button>
              </Link>

              <button 
                onClick={handleHelpClick}
                className="text-muted-foreground hover:text-primary transition-colors"
                data-testid="button-help-nav"
              >
                Help
              </button>
            </nav>
          </div>
          
          {/* Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-md hover:bg-muted transition-colors"
              data-testid="button-theme-toggle"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 text-accent" />
              ) : (
                <Sun className="w-4 h-4 text-accent" />
              )}
            </button>
            
            {/* Chatbot Toggle */}
            <button 
              onClick={onChatToggle}
              className="p-2 rounded-md hover:bg-muted transition-colors relative"
              data-testid="button-chat-toggle"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></span>
            </button>
            
            {/* Enhanced User Menu with Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 px-3" data-testid="button-user-menu">
                    {user.user_metadata?.avatar_url && (
                      <img 
                        src={user.user_metadata.avatar_url} 
                        alt="User avatar" 
                        className="w-8 h-8 rounded-full object-cover" 
                        data-testid="img-user-avatar"
                      />
                    )}
                    <div className="hidden sm:block text-left">
                      <div className="text-sm font-medium" data-testid="text-username">
                        {user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]" data-testid="text-user-email">
                        {user.email}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      {user.user_metadata?.avatar_url && (
                        <img 
                          src={user.user_metadata.avatar_url} 
                          alt="User avatar" 
                          className="w-6 h-6 rounded-full object-cover" 
                        />
                      )}
                      <div>
                        <div className="font-medium text-sm">
                          {user.user_metadata?.username || user.user_metadata?.full_name || user.user_metadata?.name || 'User'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" data-testid="menu-settings">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={handleHelpClick} data-testid="menu-help">
                    <HelpCircle className="w-4 h-4 mr-2" />
                    Help & Support
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" 
                    onClick={handleLogout}
                    data-testid="menu-logout"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
      
      {/* Help Form Modal */}
      {showHelpForm && (
        <HelpForm onClose={() => setShowHelpForm(false)} />
      )}
    </header>
  );
}
