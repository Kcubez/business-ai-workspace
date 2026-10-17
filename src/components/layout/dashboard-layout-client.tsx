'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  ClipboardCheck,
  Lightbulb,
  Settings,
  CalendarDays,
  Package,
  ShoppingCart,
  UtensilsCrossed,
  Building2,
  BriefcaseBusiness,
  HeartPulse,
  ChevronDown,
  Menu,
  Database,
  Check,
  Stethoscope,
  Laptop,
  ShoppingBag,
  Utensils,
  Building,
  GraduationCap,
  Truck,
  Factory,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useIndustry } from '@/context/industry-context';
import { useAuth } from '@/context/auth-context';
import { INDUSTRIES, IndustryId, SidebarIcon } from '@/data/industries';
import { TopHeaderBar } from '@/components/layout/top-header-bar';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const industryIcons: Record<string, IconComponent> = {
  Stethoscope,
  Laptop,
  ShoppingBag,
  Utensils,
  Building,
  GraduationCap,
  Truck,
  Factory,
};

const sidebarIcons: Record<SidebarIcon, IconComponent> = {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  Users,
  ClipboardCheck,
  Lightbulb,
  Settings,
  CalendarDays,
  Package,
  ShoppingCart,
  UtensilsCrossed,
  Building2,
  GraduationCap,
  Truck,
  Factory,
  BriefcaseBusiness,
  HeartPulse,
};

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentIndustry, currentIndustryId, setIndustryId, allIndustries, isHydrated } = useIndustry();
  const sortedIndustries = [...allIndustries].sort((a, b) => a.name.localeCompare(b.name, 'en'));
  const { user, logout } = useAuth();

  // If on login page, render children without sidebar shell
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Server HTML cannot know the locally saved sector. Keep both the shell and
  // page neutral until storage restoration has completed.
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col md:flex-row" role="status" aria-label="Loading workspace" aria-busy="true">
        <div aria-hidden="true" className="md:hidden h-14 shrink-0 border-b border-slate-800 bg-[#020617] flex items-center gap-3 px-4">
          <div className="h-8 w-8 rounded-lg bg-slate-800" />
          <span className="text-sm font-bold text-white">Business AI</span>
        </div>
        <div aria-hidden="true" className="hidden md:flex w-64 h-screen sticky top-0 shrink-0 flex-col bg-[#020617] border-r border-slate-900 shadow-2xl">
          <div className="flex items-center gap-3 p-4 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-slate-800 shrink-0" />
            <div>
              <div className="text-sm font-bold tracking-tight text-white">Business AI</div>
              <div className="text-[11px] font-medium text-slate-500">Multi-Industry OS</div>
            </div>
          </div>
          <div className="p-3 border-b border-slate-800/80">
            <div className="h-2.5 w-24 bg-slate-800 rounded mb-2" />
            <div className="h-14 rounded-xl border border-slate-800 bg-slate-900" />
          </div>
          <div className="space-y-3 p-4">
            {[32, 40, 28, 36, 32, 40].map((width, index) => (
              <div key={index} className="h-9 flex items-center gap-3">
                <div className="h-4 w-4 rounded bg-slate-800" />
                <div className="h-3 rounded bg-slate-800" style={{ width: `${width * 3}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-auto p-4 border-t border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800" />
            <div className="w-24 h-3 rounded bg-slate-800" />
          </div>
        </div>
        <div aria-hidden="true" className="flex flex-1 min-w-0 flex-col">
          <div className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 flex items-center">
            <div className="h-7 w-full max-w-md rounded-xl bg-slate-100 dark:bg-slate-800" />
          </div>
          <div className="flex-1 bg-slate-50 dark:bg-background p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-5">
              <div className="h-6 w-48 rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-9 w-2/3 max-w-lg rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Navigation labels are source configuration, rather than cached demo data,
  // so renamed destinations are visible immediately after a refresh.
  const navGroups = INDUSTRIES[currentIndustryId].sidebarGroups;

  const CurrentIcon = industryIcons[currentIndustry.icon] || Database;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between gap-2 px-4 h-14 border-b border-slate-800 bg-[#020617] text-white sticky top-0 z-40 shadow-lg">
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: isHydrated ? currentIndustry.color : '#64748b' }}
            suppressHydrationWarning
          >
            {isHydrated ? <CurrentIcon className="w-4 h-4" /> : <div className="w-4 h-4" />}
          </div>
          <span className="font-bold text-sm truncate text-white" suppressHydrationWarning>
            {isHydrated ? currentIndustry.name : ''}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open navigation"
                  className="text-white hover:bg-white/10"
                />
              }
            >
              <Menu className="w-5 h-5" />
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-[#020617] text-white border-r border-slate-800 p-0 w-72"
            >
              <SheetTitle className="sr-only">Primary navigation</SheetTitle>
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: currentIndustry.color }}
                  >
                    <CurrentIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm text-white">Business AI</h1>
                    <p className="text-[10px] text-sky-400 font-medium">Multi-Industry Edition</p>
                  </div>
                </div>
              </div>

              {/* Mobile Industry Switcher */}
              <div className="p-3 border-b border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                  Select Industry Workspace
                </p>
                <div className="space-y-1">
                  {sortedIndustries.map((ind) => {
                    const IndIcon = industryIcons[ind.icon] || Database;
                    const isSelected = ind.id === currentIndustryId;
                    return (
                      <button
                        key={ind.id}
                        onClick={() => {
                          setIndustryId(ind.id as IndustryId);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          isSelected ? 'bg-white/15 text-white' : 'text-slate-400 hover:bg-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <IndIcon className="w-4 h-4" />
                          <span>{ind.name}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-sky-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 overflow-y-auto">
                {navGroups.map((group) => (
                  <div key={group.label} className="mb-4">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">
                      {group.label}
                    </p>
                    <nav className="space-y-1">
                      {group.items.map((item) => {
                        const isActive =
                          pathname === item.href ||
                          (item.href !== '/' && pathname.startsWith(item.href));
                        const Icon = sidebarIcons[item.icon];
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'text-white'
                                : 'text-slate-400 hover:bg-white/5'
                            }`}
                            style={
                              isActive
                                ? {
                                    backgroundColor: `${currentIndustry.color}22`,
                                    borderLeftWidth: '3px',
                                    borderLeftStyle: 'solid',
                                    borderLeftColor: currentIndustry.color,
                                  }
                                : undefined
                            }
                            suppressHydrationWarning
                          >
                            <Icon
                              className="w-4 h-4"
                              style={isActive ? { color: currentIndustry.color } : undefined}
                              suppressHydrationWarning
                            />
                            <span className={isActive ? 'font-semibold text-white' : ''}>
                              {item.title}
                            </span>
                          </Link>
                        );
                      })}
                    </nav>
                  </div>
                ))}
              </div>

              {/* Mobile Drawer Footer User Profile */}
              <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-8 w-8 bg-sky-900 text-sky-300 border border-sky-700">
                      <AvatarFallback className="text-xs font-bold">
                        {user?.avatarInitials ?? 'MO'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {user?.name ?? 'MOT'}
                      </p>
                      <p className="text-[10px] text-sky-400 truncate">
                        {user?.email ?? 'mot@gmail.com'}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full justify-center gap-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Sidebar with Compact Mode Toggle */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-[#020617] text-white h-screen sticky top-0 shadow-2xl border-r border-slate-900 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Header Branding & Collapse Toggle */}
        <div className={`border-b border-slate-800 flex items-center transition-all ${isSidebarCollapsed ? 'p-3 justify-center' : 'p-4 justify-between'}`}>
          {isSidebarCollapsed ? (
            <button
              onClick={() => setIsSidebarCollapsed(false)}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Expand Sidebar"
              aria-label="Expand Sidebar"
            >
              <PanelLeftOpen className="w-5 h-5" />
            </button>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors shrink-0"
                  style={{ backgroundColor: isHydrated ? currentIndustry.color : '#64748b' }}
                  suppressHydrationWarning
                >
                  {isHydrated ? <CurrentIcon className="w-5 h-5" /> : <div className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <h1 className="font-bold text-sm tracking-tight text-white truncate">Business AI</h1>
                  <p
                    className="text-[11px] font-medium transition-colors truncate"
                    style={{ color: isHydrated ? currentIndustry.color : '#64748b' }}
                    suppressHydrationWarning
                  >
                    Multi-Industry OS
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSidebarCollapsed(true)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Industry Workspace Switcher Dropdown */}
        <div className={`border-b border-slate-800/80 ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
          {!isSidebarCollapsed && (
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-2">
              Active Industry
            </p>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  className={`w-full flex items-center rounded-xl bg-slate-900 border hover:bg-slate-800/80 text-left transition-all cursor-pointer ${
                    isSidebarCollapsed ? 'p-2 justify-center' : 'justify-between gap-2 p-2.5'
                  }`}
                  style={{ borderColor: isHydrated ? `${currentIndustry.color}44` : '#64748b44' }}
                  suppressHydrationWarning
                  title={isSidebarCollapsed ? currentIndustry.name : undefined}
                />
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 text-xs font-semibold"
                  style={{ backgroundColor: isHydrated ? currentIndustry.color : '#64748b' }}
                  suppressHydrationWarning
                >
                  {isHydrated ? <CurrentIcon className="w-3.5 h-3.5" /> : <div className="w-3.5 h-3.5" />}
                </div>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1" suppressHydrationWarning>
                    <div className="text-xs font-semibold text-white truncate">
                      {isHydrated ? currentIndustry.name : ''}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {isHydrated ? currentIndustry.badge : ''}
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-60 bg-slate-900 text-white border-slate-800">
              <DropdownMenuLabel className="text-[11px] text-slate-400 font-medium">
                Switch Business Sector
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              {sortedIndustries.map((ind) => {
                const IndIcon = industryIcons[ind.icon] || Database;
                const isSelected = ind.id === currentIndustryId;
                return (
                  <DropdownMenuItem
                    key={ind.id}
                    onClick={() => setIndustryId(ind.id as IndustryId)}
                    className="flex items-center justify-between gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-800 focus:bg-slate-800"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-6 h-6 rounded flex items-center justify-center text-white text-xs shrink-0"
                        style={{ backgroundColor: ind.color }}
                      >
                        <IndIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-white truncate">{ind.name}</div>
                        <div className="text-[10px] text-slate-400 truncate">{ind.badge}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: currentIndustry.color }}
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Section */}
        <div className={`flex-1 overflow-y-auto ${isSidebarCollapsed ? 'p-2 space-y-3' : 'p-3 space-y-4'}`}>
          {navGroups.map((group) => (
            <div key={group.label}>
              {!isSidebarCollapsed && (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 px-3 truncate">
                  {group.label}
                </p>
              )}
              <nav className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== '/' && pathname.startsWith(item.href));
                  const Icon = sidebarIcons[item.icon];
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isSidebarCollapsed ? item.title : undefined}
                      className={`flex items-center rounded-lg text-xs font-medium transition-all ${
                        isSidebarCollapsed
                          ? 'justify-center p-2.5'
                          : 'gap-3 px-3 py-2.5'
                      } ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      style={
                        isActive
                          ? isSidebarCollapsed
                            ? {
                                backgroundColor: `${currentIndustry.color}22`,
                                outline: `1.5px solid ${currentIndustry.color}`,
                                outlineOffset: '-1px',
                              }
                            : {
                                backgroundColor: `${currentIndustry.color}22`,
                                borderLeftWidth: '3.5px',
                                borderLeftStyle: 'solid',
                                borderLeftColor: currentIndustry.color,
                              }
                          : undefined
                      }
                      suppressHydrationWarning
                    >
                      <Icon
                        className="w-4 h-4 transition-colors shrink-0"
                        style={isActive ? { color: currentIndustry.color } : undefined}
                        suppressHydrationWarning
                      />
                      {!isSidebarCollapsed && (
                        <span className={`truncate ${isActive ? 'font-semibold text-white' : ''}`}>
                          {item.title}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Profile Section with Logout */}
        <div className={`border-t border-slate-800 ${isSidebarCollapsed ? 'p-2' : 'p-3'}`}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={`w-full flex items-center rounded-xl hover:bg-white/8 transition-colors text-left cursor-pointer ${
                    isSidebarCollapsed ? 'justify-center p-1.5' : 'justify-between gap-2.5 p-2'
                  }`}
                />
              }
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar className="h-8 w-8 bg-sky-900 text-sky-300 border border-sky-700 shrink-0">
                  <AvatarFallback className="bg-sky-900 text-sky-300 text-xs font-bold">
                    {user?.avatarInitials ?? 'MO'}
                  </AvatarFallback>
                </Avatar>
                {!isSidebarCollapsed && (
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-white truncate">
                      {user?.name ?? 'MOT'}
                    </div>
                    <div className="text-[10px] text-sky-400 truncate">
                      {user?.email ?? 'mot@gmail.com'}
                    </div>
                  </div>
                )}
              </div>
              {!isSidebarCollapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isSidebarCollapsed ? 'center' : 'end'} side="top" className="w-60 mb-2 bg-slate-900 border-slate-800 text-white shadow-xl">
              <DropdownMenuLabel className="font-normal p-2.5">
                <p className="text-xs font-semibold text-white">{user?.name ?? 'MOT'}</p>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  {user?.email ?? 'mot@gmail.com'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-950 text-sky-400 border border-sky-800">
                  Role: <span className="uppercase">{user?.role ?? 'admin'}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-800" />
              <DropdownMenuItem
                onClick={logout}
                className="cursor-pointer text-rose-400 focus:text-rose-300 focus:bg-rose-950/40 p-2 text-xs flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content Area with sticky TopHeaderBar */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeaderBar />
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 sm:p-6 md:p-8 bg-slate-50 dark:bg-background">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
