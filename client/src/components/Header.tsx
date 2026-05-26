import { useState } from "react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { Sun, Moon, Info, BarChart3, Mail, ArrowLeft, Download, Share2, Menu, X, Github } from "lucide-react";

interface HeaderProps {
  onDashboardToggle?: () => void;
}

export default function Header({ onDashboardToggle }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();
  const [location] = useLocation();
  const isContactPage = location === '/contact';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleExportPDF = () => {
    document.dispatchEvent(new CustomEvent('export-map'));
    setIsMobileMenuOpen(false);
  };
  
  const handleShareMap = () => {
    document.dispatchEvent(new CustomEvent('share-map'));
    setIsMobileMenuOpen(false);
  };

  const handleDashboard = () => {
    if (onDashboardToggle) onDashboardToggle();
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className="glass sticky top-0 z-[600] w-full">
        <div className="w-full px-4 md:px-8 border-b border-border/40">
          <div className="flex justify-between items-center h-20">
            {/* Logo or Back Button */}
            <div className="flex items-center space-x-3">
              {isContactPage ? (
                <Link href="/">
                  <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-md shadow-primary/20">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Home</span>
                  </button>
                </Link>
              ) : (
                <>
                  <img src="/favicon.png" alt="InfraVision Logo" className="w-8 h-8 rounded-lg object-cover" />
                  <div>
                    <h1 className="text-xl font-heading font-bold text-gradient">InfraVision</h1>
                    <p className="text-xs text-muted-foreground hidden sm:block">Green Hydrogen Planning</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Desktop Navigation & Actions */}
            {!isContactPage && (
              <div className="hidden md:flex items-center space-x-4">
                <nav className="flex items-center space-x-2">
                  {onDashboardToggle && (
                    <button 
                      className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95"
                      onClick={onDashboardToggle}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                  )}
                  
                  <Link href="/about">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95">
                      <Info className="w-4 h-4" />
                      <span>About</span>
                    </button>
                  </Link>

                  <Link href="/contact">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-105 active:scale-95">
                      <Mail className="w-4 h-4" />
                      <span>Contact</span>
                    </button>
                  </Link>
                </nav>

                <div className="h-6 w-px bg-border/60 mx-2"></div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleExportPDF}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                    title="Export Image"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleShareMap}
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                    title="Share Map"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                  
                  <a 
                    href="https://github.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-300 hover:scale-110"
                    title="GitHub Repository"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                  
                  {/* Theme Toggle */}
                  <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-muted transition-all duration-500 hover:rotate-180 hover:scale-110 active:scale-95 flex items-center justify-center overflow-hidden relative"
                  >
                    <div className={`transition-all duration-500 transform ${theme === 'light' ? 'rotate-0 opacity-100' : 'rotate-90 opacity-0 absolute'}`}>
                      <Moon className="w-5 h-5 text-accent" />
                    </div>
                    <div className={`transition-all duration-500 transform ${theme === 'dark' ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0 absolute'}`}>
                      <Sun className="w-5 h-5 text-accent" />
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Toggle Button */}
            {!isContactPage && (
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="p-2 rounded-lg bg-background/50 border border-border/50 text-foreground hover:bg-muted transition-colors shadow-sm"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[700] md:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sliding Menu */}
      <div 
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-background/95 backdrop-blur-xl border-l border-border/50 z-[710] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <span className="font-bold text-lg text-foreground">Menu</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 rounded-full bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col p-4 space-y-3 overflow-y-auto hide-scrollbar">
          {onDashboardToggle && (
            <button 
              className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-primary/10 text-foreground bg-muted/30"
              onClick={handleDashboard}
            >
              <div className="p-2 rounded-lg bg-primary/10"><BarChart3 className="w-5 h-5 text-primary" /></div>
              <span>Plants Dashboard</span>
            </button>
          )}
          
          <Link href="/about" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-primary/10 text-foreground cursor-pointer bg-muted/30">
              <div className="p-2 rounded-lg bg-primary/10"><Info className="w-5 h-5 text-primary" /></div>
              <span>About Us</span>
            </div>
          </Link>

          <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-primary/10 text-foreground cursor-pointer bg-muted/30">
              <div className="p-2 rounded-lg bg-primary/10"><Mail className="w-5 h-5 text-primary" /></div>
              <span>Contact Support</span>
            </div>
          </Link>

          <div className="h-px bg-border/50 w-full my-4"></div>

          <button 
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-muted text-foreground bg-background border border-border/30"
            onClick={handleExportPDF}
          >
            <div className="p-2 rounded-lg bg-muted"><Download className="w-5 h-5 text-muted-foreground" /></div>
            <span>Export Map View</span>
          </button>

          <button 
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-muted text-foreground bg-background border border-border/30"
            onClick={handleShareMap}
          >
            <div className="p-2 rounded-lg bg-muted"><Share2 className="w-5 h-5 text-muted-foreground" /></div>
            <span>Share Map Link</span>
          </button>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-muted text-foreground bg-background border border-border/30"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="p-2 rounded-lg bg-muted">
              <Github className="w-5 h-5 text-muted-foreground" />
            </div>
            <span>GitHub Repository</span>
          </a>

          <div className="h-px bg-border/50 w-full my-4"></div>

          <button 
            className="flex items-center justify-between px-4 py-3 rounded-xl font-medium text-base transition-colors hover:bg-muted text-foreground bg-background border border-border/30"
            onClick={toggleTheme}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {theme === 'light' ? <Sun className="w-5 h-5 text-accent" /> : <Moon className="w-5 h-5 text-accent" />}
              </div>
              <span>Theme</span>
            </div>
            <span className="text-sm font-bold text-primary capitalize">{theme} Mode</span>
          </button>
        </div>
      </div>
    </>
  );
}
