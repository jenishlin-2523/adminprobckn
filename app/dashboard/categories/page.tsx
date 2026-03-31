"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { Plus, Trash2, Edit2, X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add state
  const [newCatName, setNewCatName] = useState("");
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCatName, setEditCatName] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const cats: Category[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      // Sort alphabetically
      cats.sort((a, b) => a.name.localeCompare(b.name));
      setCategories(cats);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setAdding(true);
    try {
      await addDoc(collection(db, "categories"), { name: newCatName.trim() });
      setNewCatName("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteDoc(doc(db, "categories", id));
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditCatName(cat.name);
  };

  const saveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId || !editCatName.trim()) return;
    try {
      await updateDoc(doc(db, "categories", editingId), { name: editCatName.trim() });
      setEditingId(null);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
          <p className="mt-2 text-base text-slate-500 font-medium">Manage product categories for your store.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Add New Header */}
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <form onSubmit={handleAdd} className="flex space-x-4 max-w-2xl">
            <input
              type="text"
              placeholder="New Category Name..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="flex-1 rounded-xl border-slate-200 bg-white ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-3 shadow-sm font-medium"
              required
            />
            <button
              type="submit"
              disabled={adding}
              className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 flex items-center space-x-2 disabled:opacity-50 font-bold shadow-md shadow-orange-500/20 transition-all active:scale-[0.98]"
            >
              <Plus className="w-5 h-5 font-bold" />
              <span>{adding ? "Adding..." : "Add Category"}</span>
            </button>
          </form>
        </div>

        {/* List */}
        <div className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 font-medium">No categories found. Create one above!</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {categories.map((cat) => (
                <li key={cat.id} className="p-6 sm:px-8 flex items-center justify-between hover:bg-orange-50/30 transition-colors">
                  {editingId === cat.id ? (
                    <form onSubmit={saveEdit} className="flex-1 flex space-x-4 mr-4 max-w-2xl">
                      <input
                        type="text"
                        value={editCatName}
                        onChange={(e) => setEditCatName(e.target.value)}
                        className="flex-1 rounded-lg border-slate-200 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-orange-500 px-4 py-2 font-medium"
                        autoFocus
                        required
                      />
                      <button type="submit" className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-100 transition-colors shadow-sm">
                        <Check className="w-5 h-5" />
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors shadow-sm">
                        <X className="w-5 h-5" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <span className="text-lg font-bold text-slate-800">{cat.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-3 text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-100"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-3 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shadow-sm bg-white border border-slate-100"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
