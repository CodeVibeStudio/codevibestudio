// src/app/admin/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { Pencil, Trash2, Layers, X, Tag } from "lucide-react";
import Link from "next/link";

// --- Tipos e Dados Iniciais ---
type ProductStatus = "Em Produção" | "Em Desenvolvimento" | "Projeto Futuro";

type Product = {
  id: number;
  name: string;
  type: "saas" | "app";
  slogan: string;
  description: string;
  logo_url: string;
  web_link: string | null;
  app_link: string | null;
  slug: string | null;
  send_email: string | null;
  contact_form: boolean;
  status: ProductStatus | null; // NOVA PROPRIEDADE
};

type Notification = {
  message: string;
  type: "success" | "error";
};

const initialFormData: Omit<Product, "id"> = {
  name: "",
  type: "saas",
  slogan: "",
  description: "",
  logo_url: "",
  web_link: "",
  app_link: "",
  slug: "",
  send_email: "",
  contact_form: false,
  status: "Em Produção", // NOVO VALOR PADRÃO
};

// --- Componentes de UI (sem alterações lógicas) ---

const NotificationBanner = ({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bgColor =
    notification.type === "success"
      ? "bg-green-100 border-green-500 text-green-700"
      : "bg-red-100 border-red-500 text-red-700";
  return (
    <div
      className={`p-4 border-l-4 ${bgColor} rounded-md shadow-md flex justify-between items-center mb-6`}
    >
      <p>{notification.message}</p>
      <button
        onClick={onDismiss}
        className="p-1 rounded-full hover:bg-black/10"
      >
        <X size={20} />
      </button>
    </div>
  );
};

const ConfirmationModal = ({
  item,
  onConfirm,
  onCancel,
}: {
  item: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
      <p className="my-4 text-gray-600">
        Tem a certeza de que quer apagar o produto{" "}
        <strong className="text-red-600">{item.name}</strong>? Esta ação é
        irreversível.
      </p>
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Sim, Apagar
        </button>
      </div>
    </div>
  </div>
);

// --- Componente Principal da Página ---
export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<Omit<Product, "id"> | Product>(
    initialFormData
  );
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (
        !session ||
        session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
      ) {
        router.push("/admin/login");
      } else {
        setUser(session.user);
        fetchProducts();
        setLoading(false);
      }
    };
    checkUser();
  }, [router, supabase]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (data) setProducts(data as Product[]);
    if (error)
      setNotification({
        message: `Erro ao buscar produtos: ${error.message}`,
        type: "error",
      });
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
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

  const handleDeleteClick = (product: Product) => {
    setProductToDelete(product);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    if (productToDelete.logo_url) {
      const logoPath = productToDelete.logo_url.split("/product-logos/")[1];
      if (logoPath)
        await supabase.storage.from("product-logos").remove([logoPath]);
    }
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productToDelete.id);
    if (error) {
      setNotification({
        message: `Erro ao apagar o produto: ${error.message}`,
        type: "error",
      });
    } else {
      setNotification({
        message: "Produto apagado com sucesso!",
        type: "success",
      });
      fetchProducts();
    }
    setProductToDelete(null);
  };

  const sanitizeFilename = (filename: string): string => {
    const withoutDiacritics = filename
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const sanitized = withoutDiacritics
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-.]/g, "");
    return sanitized;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    let logoUrl = "logo_url" in formData ? formData.logo_url : "";

    if (logoFile) {
      const sanitizedName = sanitizeFilename(logoFile.name);
      const filePath = `public/${Date.now()}-${sanitizedName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-logos")
        .upload(filePath, logoFile);
      if (uploadError) {
        setNotification({
          message: `Erro ao enviar o logo: ${uploadError.message}`,
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-logos").getPublicUrl(filePath);
      logoUrl = publicUrl;
    }

    const { id, ...dataToSave } = formData as Product;
    // Garante que o status seja salvo corretamente
    const productData = {
      ...dataToSave,
      logo_url: logoUrl,
      status: formData.status,
    };

    let error;
    if (editingProduct) {
      const { error: updateError } = await supabase
        .from("products")
        .update(productData)
        .eq("id", editingProduct.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("products")
        .insert(productData);
      error = insertError;
    }

    if (error) {
      setNotification({
        message: `Erro ao salvar o produto: ${error.message}`,
        type: "error",
      });
    } else {
      setNotification({
        message: `Produto ${
          editingProduct ? "atualizado" : "salvo"
        } com sucesso!`,
        type: "success",
      });
      fetchProducts();
      handleCancelEdit();
    }

    setLogoFile(null);
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        A carregar...
      </div>
    );

  const statusStyles: { [key in ProductStatus]: string } = {
    "Em Produção": "bg-green-100 text-green-800",
    "Em Desenvolvimento": "bg-blue-100 text-blue-800",
    "Projeto Futuro": "bg-purple-100 text-purple-800",
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {productToDelete && (
        <ConfirmationModal
          item={productToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Painel de Gestão</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition"
          >
            Sair
          </button>
        </div>
        {notification && (
          <NotificationBanner
            notification={notification}
            onDismiss={() => setNotification(null)}
          />
        )}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <h2 className="text-2xl font-semibold mb-2 md:col-span-2">
            {editingProduct ? "A Editar Produto" : "Adicionar Novo Produto"}
          </h2>

          {/* Coluna 1 */}
          <div className="space-y-4">
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Nome do Produto"
              className="w-full p-2 border rounded"
              required
            />
            <input
              name="slug"
              value={"slug" in formData ? (formData.slug ?? "") : ""}
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
              className="w-full p-2 border rounded h-24"
            />
          </div>

          {/* Coluna 2 */}
          <div className="space-y-4">
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="saas">SaaS</option>
              <option value="app">App</option>
            </select>

            {/* NOVO CAMPO DE STATUS */}
            <select
              name="status"
              value={formData.status ?? "Em Produção"}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            >
              <option value="Em Produção">Em Produção</option>
              <option value="Em Desenvolvimento">Em Desenvolvimento</option>
              <option value="Projeto Futuro">Projeto Futuro</option>
            </select>

            <input
              name="web_link"
              value={"web_link" in formData ? (formData.web_link ?? "") : ""}
              onChange={handleInputChange}
              placeholder="Link da Web"
              className="w-full p-2 border rounded"
            />
            <input
              name="app_link"
              value={"app_link" in formData ? (formData.app_link ?? "") : ""}
              onChange={handleInputChange}
              placeholder="Link do App"
              className="w-full p-2 border rounded"
            />
            <input
              name="send_email"
              value={
                "send_email" in formData ? (formData.send_email ?? "") : ""
              }
              onChange={handleInputChange}
              placeholder="E-mail para receber notificações"
              className="w-full p-2 border rounded"
            />
          </div>

          {/* Seção de Opções (abaixo das colunas) */}
          <div className="md:col-span-2 border-t pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="contact_form"
                checked={
                  "contact_form" in formData ? formData.contact_form : false
                }
                onChange={handleInputChange}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="font-medium text-gray-700">
                Habilitar formulário de orçamento
              </span>
            </label>
            <p className="text-xs text-gray-500 mt-1 ml-8">
              Marque esta opção se o produto não tiver planos e necessitar de um
              contacto para orçamento.
            </p>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-2 text-sm font-medium">
              Logo do Produto (envie apenas se quiser alterar)
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept="image/*"
            />
          </div>

          <div className="md:col-span-2 flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting
                ? "A salvar..."
                : editingProduct
                  ? "Atualizar Produto"
                  : "Salvar Produto"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600"
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
                    src={
                      product.logo_url ||
                      "https://placehold.co/64x64/eee/ccc?text=Logo"
                    }
                    alt={product.name}
                    className="w-16 h-16 rounded-md mb-4 object-cover"
                  />
                  <h3 className="font-bold text-xl">{product.name}</h3>

                  {/* EXIBIÇÃO DO STATUS NA LISTA */}
                  {product.status && (
                    <span
                      className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full inline-block my-2 ${statusStyles[product.status] || "bg-gray-100 text-gray-800"}`}
                    >
                      {product.status}
                    </span>
                  )}

                  <p className="text-sm text-gray-600">{product.description}</p>
                  {product.contact_form && (
                    <p className="text-xs text-blue-600 font-bold mt-2">
                      Formulário de Contato Ativo
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t flex justify-end gap-2">
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
                    onClick={() => handleDeleteClick(product)}
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
