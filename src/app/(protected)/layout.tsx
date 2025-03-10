"use client";

import React from "react";
import { Moon, Sun } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { ThemeProvider, useTheme } from "next-themes";

import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";

interface SidebarLayoutProps {
  children: React.ReactNode;
}

const SidebarLayout = ({ children }: SidebarLayoutProps) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SidebarProvider>
        <AppSidebar />
        <main className="m-2 w-full">
          <div className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
            {/* <SearchBar /> */}
            <div className="ml-auto flex items-center gap-4">
              {theme === "light" ? (
                <Sun
                  className="h-6 w-6 cursor-pointer text-foreground"
                  onClick={toggleTheme}
                />
              ) : (
                <Moon
                  className="h-6 w-6 cursor-pointer text-foreground"
                  onClick={toggleTheme}
                />
              )}
              <UserButton />
            </div>
          </div>
          <div className="h-4"></div>
          {/* main content */}
          <div className="h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
            {children}
          </div>
        </main>
      </SidebarProvider>
    </ThemeProvider>
  );
};

export default SidebarLayout;
