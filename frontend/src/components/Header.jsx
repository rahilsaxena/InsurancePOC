import { Search, User, ChevronDown } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export const Header = ({ activeView, setActiveView, searchQuery, setSearchQuery }) => {
  return (
    <header 
      className="fixed top-0 left-0 right-0 h-16 bg-[#0B1120] text-white flex items-center px-6 z-50 shadow-lg"
      data-testid="header"
    >
      {/* Logo */}
      <div className="flex items-center gap-3" data-testid="logo">
        <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-lg">
          IN
        </div>
        <span className="font-barlow text-xl font-semibold tracking-tight">INSpace</span>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex items-center ml-12 gap-1" data-testid="nav-tabs">
        <Button
          variant={activeView === 'portfolio' ? 'default' : 'ghost'}
          className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
            activeView === 'portfolio'
              ? 'bg-sky-600 text-white hover:bg-sky-700'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setActiveView('portfolio')}
          data-testid="portfolio-view-btn"
        >
          Portfolio View
        </Button>
        <Button
          variant={activeView === 'simulation' ? 'default' : 'ghost'}
          className={`rounded-sm px-4 py-2 text-sm font-medium transition-colors ${
            activeView === 'simulation'
              ? 'bg-sky-600 text-white hover:bg-sky-700'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
          onClick={() => setActiveView('simulation')}
          data-testid="simulation-view-btn"
        >
          Event Simulation
        </Button>
      </nav>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8" data-testid="search-container">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search by Address or Asset ID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white/10 border-white/20 text-white placeholder:text-slate-400 rounded-sm focus:bg-white/15 focus:border-sky-500"
            data-testid="search-input"
          />
        </div>
      </div>

      {/* User Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-white/10"
            data-testid="user-menu-btn"
          >
            <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem data-testid="profile-menu-item">Profile</DropdownMenuItem>
          <DropdownMenuItem data-testid="settings-menu-item">Settings</DropdownMenuItem>
          <DropdownMenuItem data-testid="logout-menu-item">Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
