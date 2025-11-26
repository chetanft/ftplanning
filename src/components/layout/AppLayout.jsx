import React, { useState, useEffect } from 'react';
import { Truck, Menu, X, Settings, Bell, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = ({ navigation, currentView, onChangeView, isOpen, toggleSidebar, isCollapsed, toggleCollapse }) => {
  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 bg-card border-r border-border transform transition-all duration-300 ease-in-out md:translate-x-0 md:static md:inset-auto md:flex md:flex-col",
      isOpen ? "translate-x-0" : "-translate-x-full",
      isCollapsed ? "md:w-16" : "md:w-64",
      "w-64"
    )}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <div className={cn(
          "flex items-center space-x-2 transition-opacity duration-300",
          isCollapsed && "md:opacity-0 md:w-0 md:overflow-hidden"
        )}>
          <Truck className="h-6 w-6 text-primary flex-shrink-0" />
          <span className="text-lg font-bold whitespace-nowrap">SmartDispatch</span>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="hidden md:flex" 
            onClick={toggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {navigation.map((item) => {
             const Icon = item.icon;
             const isActive = currentView === item.id;
             return (
               <Button
                 key={item.id}
                 variant={isActive ? "secondary" : "ghost"}
                 className={cn(
                  "w-full transition-all duration-300",
                  isCollapsed ? "md:justify-center md:px-2" : "justify-start",
                  isActive && "bg-secondary text-secondary-foreground font-medium"
                 )}
                 onClick={() => {
                   onChangeView(item.id);
                   if (window.innerWidth < 768) toggleSidebar(); 
                 }}
                 title={isCollapsed ? item.label : undefined}
               >
                 <Icon className={cn(
                   "h-5 w-5 flex-shrink-0",
                   !isCollapsed && "mr-3"
                 )} />
                 <span className={cn(
                   "whitespace-nowrap transition-opacity duration-300",
                   isCollapsed && "md:opacity-0 md:w-0 md:overflow-hidden"
                 )}>
                   {item.label}
                 </span>
               </Button>
             );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-border">
        <div className={cn(
          "flex items-center space-x-3 text-sm text-muted-foreground transition-opacity duration-300",
          isCollapsed && "md:justify-center md:space-x-0"
        )}>
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
          <span className={cn(
            "whitespace-nowrap transition-opacity duration-300",
            isCollapsed && "md:opacity-0 md:w-0 md:overflow-hidden"
          )}>
            System Online
          </span>
        </div>
      </div>
    </div>
  );
};

const Header = ({ title, toggleSidebar, onSettingsClick, toggleCollapse, isCollapsed }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="hidden md:flex mr-2" 
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onSettingsClick}>
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
           <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

const AppLayout = ({ children, navigation, currentView, onChangeView, onSettingsClick }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Load collapsed state from localStorage, default to false
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };
  
  const activeItem = navigation.find(item => item.id === currentView) || { label: 'Dashboard' };

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans antialiased">
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar 
        navigation={navigation} 
        currentView={currentView} 
        onChangeView={onChangeView}
        isOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <Header 
          title={activeItem.label} 
          toggleSidebar={toggleSidebar} 
          onSettingsClick={onSettingsClick}
          toggleCollapse={toggleCollapse}
          isCollapsed={isCollapsed}
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

