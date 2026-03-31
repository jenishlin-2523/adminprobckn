"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { CopySlash, Layers, AlignLeft, Image as ImageIcon, LayoutDashboard, LogOut } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser || currentUser.email !== 'jenishlinb@gmail.com') {
        if (currentUser) {
          await signOut(auth); // force logout if not jenishlinb@gmail.com
        }
        router.push("/");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <div className="animate-spin h-8 w-8 border-b-2 border-orange-500 rounded-full"></div>
      </div>
    );
  }

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/dashboard/products", icon: Layers },
    { name: "Categories", href: "/dashboard/categories", icon: AlignLeft },
    { name: "Banners", href: "/dashboard/banners", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Light SaaS Theme */}
      <aside className="w-64 bg-white text-slate-700 flex flex-col fixed inset-y-0 shadow-sm border-r border-slate-200 z-10">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="p-2 bg-orange-50 rounded-lg">
            <CopySlash className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">Admin<span className="text-orange-500">Pro</span></span>
            <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wider">{user.email}</p>
          </div>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${
                  isActive 
                    ? "bg-orange-50 text-orange-600" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-slate-400"}`} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
