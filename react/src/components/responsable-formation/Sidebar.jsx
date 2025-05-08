"use client";

import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeft } from "lucide-react";

import { useIsMobile } from "../../hooks/use-mobile"; // Adjusted path
import { cn } from "../../lib/utils"; // Adjusted path
import { Button } from "../ui/button"; // Adjusted path
import { Input } from "../ui/input"; // Adjusted path
import { Separator } from "../ui/separator"; // Adjusted path
import { Sheet, SheetContent } from "../ui/sheet"; // Adjusted path
import { Skeleton } from "../ui/skeleton"; // Adjusted path
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip"; // Adjusted path

const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "18rem";
const SIDEBAR_WIDTH_MOBILE = "20rem";
const SIDEBAR_WIDTH_ICON = "4rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";

const SidebarContext = React.createContext(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.");
  }
  return context;
}

const SidebarProvider = React.forwardRef(function SidebarProvider(
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange: setOpenProp,
    className,
    style,
    children,
    ...props
  },
  ref
) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value) => {
      const openState = typeof value === "function" ? value(open) : value;
      if (setOpenProp) {
        setOpenProp(openState);
      } else {
        _setOpen(openState);
      }
      // Check if document is defined (client-side)
      if (typeof document !== 'undefined') {
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
      }
    },
    [setOpenProp, open]
  );

  const toggleSidebar = React.useCallback(() => {
    return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open);
  }, [isMobile, setOpen, setOpenMobile]);

  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    // Check if window is defined (client-side)
    if (typeof window !== 'undefined') {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [toggleSidebar]);

  const state = open ? "expanded" : "collapsed";

  const contextValue = React.useMemo(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  );

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          style={{
            "--sidebar-width": SIDEBAR_WIDTH,
            "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
            ...style,
          }}
          className={cn(
            "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

SidebarProvider.displayName = "SidebarProvider";

export function Sidebar({ className, ...props }) {
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Use the imported hooks
  const location = useLocation();
  const navigate = useNavigate();

  // Get the current path to determine if we're in the /rp/ route (direct access) or /responsable-formation/ route (authenticated)
  const currentPath = location.pathname;
  const baseRoute = currentPath.startsWith('/rp') ? '/rp' : '/responsable-formation';

  // Navigation items
  const navigation = [
    { name: 'Tableau de bord', href: `${baseRoute}/dashboard`, icon: 'LayoutDashboard' },
    { name: 'Planifier Session', href: `${baseRoute}/planifier`, icon: 'Calendar' },
    { name: 'Liste Sessions', href: `${baseRoute}/sessions`, icon: 'Calendar' },
    { name: 'Validation', href: `${baseRoute}/validation`, icon: 'Users' },
    { name: 'Absences', href: `${baseRoute}/absences`, icon: 'Users' },
    { name: 'Logistique', href: `${baseRoute}/logistics`, icon: 'Truck' },
    { name: 'Documents', href: `${baseRoute}/documents`, icon: 'FileText' },
    { name: 'Rapports', href: `${baseRoute}/rapports`, icon: 'PieChart' },
  ];

  return (
    <div
      className={cn(
        "sidebar h-screen border-r border-[hsl(var(--sidebar-border))] bg-[hsl(var(--sidebar-background))] transition-all duration-300 flex-shrink-0",
        isCollapsed ? "w-[var(--sidebar-width-icon)]" : "w-[var(--sidebar-width)]",
        className
      )}
      {...props}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <span className="text-lg font-semibold">Responsable Formation</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleSidebar}
        >
          <PanelLeft className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <Separator />
      <div className="py-4">
        <nav className="grid gap-1 px-2">
          {navigation.map((item) => {
            const isActive = currentPath.includes(item.href.split('/').pop());
            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "sidebar-item justify-start",
                  isActive ? "bg-[hsl(var(--sidebar-accent))] text-[hsl(var(--sidebar-accent-foreground))]" : ""
                )}
                onClick={() => navigate(item.href)}
              >
                <span className={cn("mr-2", isCollapsed ? "sr-only" : "")}>
                  {item.name}
                </span>
              </Button>
            );
          })}
        </nav>
      </div>
      <Separator />
      <div className="mt-auto p-4">
        <Button
          variant="ghost"
          className="sidebar-item w-full justify-start"
          onClick={() => {
            // If we're in the direct access route (/rp), just redirect to the home page
            if (currentPath.startsWith('/rp')) {
              window.location.href = '/';
              return;
            }

            // Otherwise, navigate to login page
            navigate('/login');
          }}
        >
          <span className={cn("mr-2", isCollapsed ? "sr-only" : "")}>
            {currentPath.startsWith('/rp') ? "Retour" : "Déconnexion"}
          </span>
        </Button>
      </div>
    </div>
  );
}

Sidebar.displayName = "Sidebar";

export {
  SidebarProvider,
  useSidebar,
};