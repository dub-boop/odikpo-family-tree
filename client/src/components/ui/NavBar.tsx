import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { MoonIcon, SunIcon, DownloadIcon, MenuIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  isMobile?: boolean;
}

const NavLink = ({ href, children, isMobile = false }: NavLinkProps) => {
  const [location] = useLocation();
  const isActive = location === href;

  if (isMobile) {
    return (
      <Link href={href}>
        <a
          className={cn(
            isActive
              ? "bg-blue-50 border-l-4 border-primary text-primary block pl-3 pr-4 py-2 font-medium"
              : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 font-medium"
          )}
        >
          {children}
        </a>
      </Link>
    );
  }

  return (
    <Link href={href}>
      <a
        className={cn(
          isActive
            ? "border-b-2 border-primary text-gray-900 inline-flex items-center px-1 pt-1 font-medium"
            : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 font-medium"
        )}
      >
        {children}
      </a>
    </Link>
  );
};

export default function Navbar() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <a className="flex-shrink-0 flex items-center">
                <i className="ri-tree-line text-primary text-2xl mr-2"></i>
                <span className="font-bold text-xl">Odikpo Family Tree</span>
              </a>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/">Tree View</NavLink>
              <NavLink href="/members">Members</NavLink>
              <NavLink href="/history">History</NavLink>
              <NavLink href="/gallery">Gallery</NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <div className="relative inline-flex items-center cursor-pointer mr-4">
              <button onClick={toggleTheme} className="flex items-center">
                {theme === "dark" ? (
                  <SunIcon className="h-5 w-5 text-gray-600" />
                ) : (
                  <MoonIcon className="h-5 w-5 text-gray-600" />
                )}
              </button>
            </div>
            <Button size="sm" className="hidden sm:inline-flex">
              <DownloadIcon className="h-4 w-4 mr-1" /> Export
            </Button>
            <div className="sm:hidden ml-4">
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              >
                {showMobileMenu ? (
                  <XIcon className="block h-6 w-6" />
                ) : (
                  <MenuIcon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${showMobileMenu ? "block" : "hidden"}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <NavLink href="/" isMobile={true}>
            Tree View
          </NavLink>
          <NavLink href="/members" isMobile={true}>
            Members
          </NavLink>
          <NavLink href="/history" isMobile={true}>
            History
          </NavLink>
          <NavLink href="/gallery" isMobile={true}>
            Gallery
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
