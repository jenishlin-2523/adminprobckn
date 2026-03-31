"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getCountFromServer } from "firebase/firestore";

export default function DashboardPage() {
  const [stats, setStats] = useState({ products: 0, categories: 0, banners: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const prodCount = await getCountFromServer(collection(db, "products"));
        const catCount = await getCountFromServer(collection(db, "categories"));
        const bannerCount = await getCountFromServer(collection(db, "banners"));

        setStats({
          products: prodCount.data().count,
          categories: catCount.data().count,
          banners: bannerCount.data().count,
        });
      } catch (err) {
        console.error("Failed to load stats", err);
      }
    }
    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
      <p className="mt-2 text-base text-slate-500 font-medium">
        Welcome to your content management system.
      </p>

      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Total Products</h3>
          <p className="text-5xl font-extrabold text-slate-900 mt-4">{stats.products}</p>
          <div className="mt-4 w-12 h-1 bg-orange-500 rounded-full"></div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Categories</h3>
          <p className="text-5xl font-extrabold text-slate-900 mt-4">{stats.categories}</p>
          <div className="mt-4 w-12 h-1 bg-orange-400 rounded-full"></div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300">
          <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest">Active Banners</h3>
          <p className="text-5xl font-extrabold text-slate-900 mt-4">{stats.banners}</p>
          <div className="mt-4 w-12 h-1 bg-orange-300 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
