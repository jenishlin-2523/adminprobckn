"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Trash2, Edit2, Layers } from "lucide-react";
import imageCompression from "browser-image-compression";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  categoryId: string;
  imageBase64: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch categories
      const catSnap = await getDocs(collection(db, "categories"));
      const cats = catSnap.docs.map(d => ({ id: d.id, name: d.data().name }));
      setCategories(cats);

      // Fetch products
      const prodSnap = await getDocs(collection(db, "products"));
      const prods = prodSnap.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Product[];
      setProducts(prods);

      if (cats.length > 0 && !categoryId) {
        setCategoryId(cats[0].id);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const options = {
        maxSizeMB: 0.3, 
        maxWidthOrHeight: 800,
        useWebWorker: true,
      };
      
      const compressedFile = await imageCompression(file, options);
      
      const reader = new FileReader();
      reader.readAsDataURL(compressedFile);
      reader.onloadend = () => {
        setImageBase64(reader.result as string);
        setUploadingImage(false);
      };
    } catch (error) {
      console.error("Compression error:", error);
      setUploadingImage(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !price || !categoryId || !imageBase64) {
      alert("Please fill in all required fields and upload an image.");
      return;
    }
    
    setAdding(true);
    try {
      await addDoc(collection(db, "products"), { 
        name: name.trim(),
        price: Number(price),
        description: description.trim(),
        categoryId,
        imageBase64,
        createdAt: new Date().toISOString()
      });
      
      // Reset form
      setName("");
      setPrice("");
      setDescription("");
      setImageBase64("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchData();
    } catch (err) {
      console.error("Error adding product:", err);
      alert("Failed to add product. May exceed sizes.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteDoc(doc(db, "products", id));
      fetchData();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Products</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">Manage products, pricing, and images seamlessly.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
            <span className="p-2.5 bg-orange-50 rounded-xl text-orange-500 shadow-sm"><Plus className="w-5 h-5" /></span>
             Add New Product
          </h2>
          <form onSubmit={handleAdd} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              
              {/* LEFT COL */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Product Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 bg-white shadow-sm font-medium"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full rounded-xl border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 bg-white shadow-sm font-bold text-orange-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full rounded-xl border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 bg-white shadow-sm font-medium text-slate-700"
                      required
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description <span className="text-slate-400 font-normal">(Optional)</span></label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full rounded-xl border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 bg-white shadow-sm resize-none"
                  />
                </div>
              </div>

              {/* RIGHT COL - IMAGE */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={fileInputRef}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-extrabold file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100 transition-colors shadow-sm cursor-pointer"
                    required
                  />
                  <p className="mt-3 text-xs font-semibold text-slate-400">Auto-compressed format via Base64 &lt;300KB.</p>
                </div>
                
                {uploadingImage && <p className="text-sm font-bold text-orange-500 animate-pulse">Compressing...</p>}
                
                <div className="h-56 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center bg-white overflow-hidden shadow-inner">
                  {imageBase64 ? (
                    <img src={imageBase64} alt="Preview" className="h-full object-contain mix-blend-multiply" />
                  ) : (
                    <span className="text-slate-300 text-sm font-bold tracking-widest uppercase">Image Preview</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-8 border-t border-slate-100 mt-2">
              <button
                type="submit"
                disabled={adding || uploadingImage || !imageBase64}
                className="px-8 py-3.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 hover:-translate-y-0.5 font-extrabold text-sm tracking-wide disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {adding ? "Saving Product..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PRODUCTS LIST */}
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 mb-8 border-b border-slate-200 pb-4">Product Catalog</h2>
        {loading ? (
          <div className="p-16 text-center text-slate-500 font-bold bg-white rounded-3xl border border-slate-100 shadow-sm text-lg">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="p-20 text-center text-slate-500 font-medium bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
            <div className="p-6 bg-slate-50 rounded-full mb-6">
              <Layers className="w-12 h-12 text-slate-300" />
            </div>
            <p className="text-lg">No products available. Add your first item above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map(product => {
              const cat = categories.find(c => c.id === product.categoryId);
              return (
                <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 ring-1 ring-slate-100 group">
                  <div className="h-60 bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-center relative group-hover:bg-orange-50/20 transition-colors">
                    <img src={product.imageBase64} alt={product.name} className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500" />
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="absolute top-3 right-3 p-2.5 bg-white text-red-500 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-105 -translate-y-2 group-hover:translate-y-0"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4 font-bold" />
                    </button>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-[10px] font-black tracking-widest uppercase text-orange-500 mb-2 bg-orange-50 w-max px-2.5 py-1 rounded-md">
                      {cat?.name || "Unknown"}
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight mb-2 group-hover:text-orange-500 transition-colors">{product.name}</h3>
                    <p className="text-2xl font-black text-slate-900 mt-auto">${Number(product.price).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
