// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Pencil, Trash2, Layers } from "lucide-react"; // Ícone novo
import Link from "next/link";

type Product = {
  id?: number;
  name: string;
  type: "saas" | "app";
  slogan: string;
  description: string;
  logo_url: string;
  web_link: string | null;
  app_link: string | null;
  slug: string | null; // Adicionamos o slug
};

const initialFormData: Product = {
  name: "",
  type: "saas",
  slogan: "",
  description: "",
  logo_url: "",
  web_link: "",
  app_link: "",
  slug: "",
};

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Product>(initialFormData);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        fetchProducts();
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (data) setProducts(data as Product[]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setLogoFile(e.target.files[0]);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData(product);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleDelete = async (productId: number, logoUrl: string) => {
    if (
      window.confirm(
        "Tem a certeza de que quer apagar este produto? Esta ação é irreversível."
      )
    ) {
      if (logoUrl) {
        const logoPath = logoUrl.split("/product-logos/")[1];
        if (logoPath)
          await supabase.storage.from("product-logos").remove([logoPath]);
      }
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) alert("Erro ao apagar o produto: " + error.message);
      else {
        alert("Produto apagado com sucesso!");
        fetchProducts();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let logoUrl = formData.logo_url;

    if (logoFile) {
      const filePath = `public/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-logos")
        .upload(filePath, logoFile);
      if (uploadError) {
        alert("Erro ao enviar o logo: " + uploadError.message);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-logos").getPublicUrl(filePath);
      logoUrl = publicUrl;
    }

    const productData = { ...formData, logo_url: logoUrl };

    let error;
    if (editingProduct) {
      const { id, ...updateData } = productData;
      const { error: updateError } = await supabase
        .from("products")
        .update(updateData)
        .eq("id", editingProduct.id);
      error = updateError;
    } else {
      const { id, ...insertData } = productData;
      const { error: insertError } = await supabase
        .from("products")
        .insert(insertData);
      error = insertError;
    }

    if (error) alert("Erro ao salvar o produto: " + error.message);
    else {
      alert(`Produto ${editingProduct ? "atualizado" : "salvo"} com sucesso!`);
      fetchProducts();
      handleCancelEdit();
    }
    setLogoFile(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        A carregar...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Painel de Gestão</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg"
          >
            Sair
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold mb-4">
            {editingProduct ? "A Editar Produto" : "Adicionar Novo Produto"}
          </h2>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nome do Produto"
            className="w-full p-2 border rounded"
            required
          />
          {/* Adicionamos o campo slug */}
          <input
            name="slug"
            value={formData.slug ?? ""}
            onChange={handleInputChange}
            placeholder="Slug para URL (ex: rescuenow)"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="slogan"
            value={formData.slogan}
            onChange={handleInputChange}
            placeholder="Slogan"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrição"
            className="w-full p-2 border rounded"
          />
          <select
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
          >
            <option value="saas">SaaS</option>
            <option value="app">App</option>
          </select>
          <input
            name="web_link"
            value={formData.web_link ?? ""}
            onChange={handleInputChange}
            placeholder="Link da Web"
            className="w-full p-2 border rounded"
          />
          <input
            name="app_link"
            value={formData.app_link ?? ""}
            onChange={handleInputChange}
            placeholder="Link do App"
            className="w-full p-2 border rounded"
          />
          <div>
            <label className="block mb-2">
              Logo do Produto (envie apenas se quiser alterar)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex gap-4">
            <button
              type="submit"
              className="w-full bg-primaria text-white font-bold py-3 rounded-lg"
            >
              {editingProduct ? "Atualizar Produto" : "Salvar Produto"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg"
              >
                Cancelar Edição
              </button>
            )}
          </div>
        </form>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Produtos Existentes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg shadow flex flex-col"
              >
                <div className="flex-grow">
                  <img
                    src={product.logo_url}
                    alt={product.name}
                    className="w-16 h-16 rounded-md mb-4 object-cover"
                  />
                  <h3 className="font-bold text-xl">{product.name}</h3>
                  <p className="text-sm text-gray-600">{product.description}</p>
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
                  {/* MUDANÇA: Botão para gerir planos */}
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="p-2 hover:bg-gray-200 rounded-full"
                    title="Gerir Planos"
                  >
                    <Layers size={18} />
                  </Link>
                  <button
                    onClick={() => handleEditClick(product)}
                    className="p-2 hover:bg-gray-200 rounded-full"
                    title="Editar Produto"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id!, product.logo_url)}
                    className="p-2 hover:bg-red-100 rounded-full text-red-600"
                    title="Apagar Produto"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
