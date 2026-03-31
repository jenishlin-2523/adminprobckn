"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Trash2, Image as ImageIcon } from "lucide-react";
import imageCompression from "browser-image-compression";

interface Banner {
  id: string;
  title: string;
  imageBase64: string;
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "banners"));
      const b: Banner[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        title: doc.data().title,
        imageBase64: doc.data().imageBase64,
      }));
      setBanners(b);
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const options = {
        maxSizeMB: 0.3, // Compress to ~300KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setUploadingImage(false);
      };
      reader.onerror = () => {
        console.error("Failed to convert file to Base64");
        setUploadingImage(false);
      };
    } catch (error) {
      console.error("Error compressing image:", error);
      setUploadingImage(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageBase64) {
      alert("Please provide both a title and an image.");
      return;
    }
    
    setAdding(true);
    try {
      await addDoc(collection(db, "banners"), { 
        title: title.trim(),
        imageBase64,
        createdAt: new Date().toISOString()
      });
      setTitle("");
      setImageBase64("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchBanners();
    } catch (err) {
      console.error("Error adding banner:", err);
      alert("Failed to add banner. May exceed Firestore document size limit if too large.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", id));
      fetchBanners();
    } catch (err) {
      console.error("Error deleting banner:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Main Banners</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">Manage large hero slides for the website home page.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ADD BANNER FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 sticky top-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="p-2 bg-orange-50 rounded-xl text-orange-500"><Plus className="w-5 h-5" /></span> Add New Banner
            </h2>
            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 bg-slate-50/50"
                  placeholder="e.g. Summer Sale"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Hero Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors cursor-pointer"
                  required
                />
                <p className="mt-2 text-xs font-semibold text-slate-400">Auto-compressed to &lt;300KB.</p>
              </div>

              {uploadingImage && <p className="text-sm font-bold text-orange-500 animate-pulse">Compressing image...</p>}
              
              {imageBase64 && (
                <div className="mt-6 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm">
                  <img src={imageBase64} alt="Preview" className="w-full h-auto object-cover" />
                </div>
              )}

              <button
                type="submit"
                disabled={adding || uploadingImage || !imageBase64}
                className="w-full mt-8 flex justify-center py-4 px-6 border border-transparent rounded-xl shadow-md shadow-orange-500/20 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {adding ? "Saving..." : "Save Banner"}
              </button>
            </form>
          </div>
        </div>

        {/* LIST */}
        <div className="lg:col-span-2">
          {loading ? (
             <div className="p-12 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm">Loading banners...</div>
          ) : banners.length === 0 ? (
            <div className="p-16 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="p-4 bg-slate-50 rounded-full mb-4">
                 <ImageIcon className="w-10 h-10 text-slate-300" />
              </div>
              <p>No banners added yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {banners.map(banner => (
                <div key={banner.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-lg transition-all duration-300">
                  <div className="sm:w-2/5 bg-slate-50 h-48 sm:h-auto overflow-hidden relative border-r border-slate-100">
                    <img src={banner.imageBase64} alt={banner.title} className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{banner.title}</h3>
                      <p className="text-xs font-mono font-medium text-slate-400 mt-2 bg-slate-50 inline-block px-2 py-1 rounded">ID: {banner.id}</p>
                    </div>
                    <div className="mt-8 flex justify-end">
                      <button
                        onClick={() => handleDelete(banner.id)}
                        className="flex items-center space-x-2 px-5 py-2.5 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors text-sm font-bold shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Delete Banner</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
