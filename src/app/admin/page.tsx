// src/app/admin/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Pencil, Trash2, X } from "lucide-react";
import RichTextEditor from "@/components/RichTextEditor";
import dynamic from "next/dynamic";

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
  status: ProductStatus | null;
  seo_title?: string;
  seo_description?: string;
};

type Notification = { message: string; type: "success" | "error" };

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
  status: "Em Produção",
  seo_title: "",
  seo_description: "",
};

// --- CORREÇÃO DEFINITIVA: Importação dinâmica do renderizador de HTML ---
// O SecureHtmlRenderer é carregado apenas no lado do cliente, o que resolve o erro de hidratação.
// O SSR é desativado para este componente, e um estado de carregamento é exibido em seu lugar.
const SecureHtmlRenderer = dynamic(
  () => import("@/components/SecureHtmlRenderer"),
  {
    ssr: false,
    loading: () => (
      <div className="prose prose-sm max-w-none text-gray-500">
        Carregando descrição...
      </div>
    ),
  }
);

// --- Componentes de UI (mantidos como estão) ---
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
    <div className={`${bgColor} px-4 py-3 border-l-4 mb-4 relative`}>
      <button
        onClick={onDismiss}
        className="absolute right-2 top-2 text-current hover:opacity-70"
      >
        <X size={16} />
      </button>
      <p className="font-medium">{notification.message}</p>
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
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Confirmar Exclusão
      </h3>
      <p className="text-gray-600 mb-6">
        Tem a certeza de que quer apagar o produto{" "}
        <span className="font-medium text-gray-900">{item.name}</span>? Esta
        ação é <span className="font-medium text-red-600">irreversível</span>.
      </p>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
        >
          Sim, Apagar
        </button>
      </div>
    </div>
  </div>
);

export default function AdminPage() {
  const supabase = createClient();
  const router = useRouter();

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

  // O estado `isClient` foi removido, pois a importação dinâmica resolve o problema de forma mais eficaz.

  useEffect(() => {
    const checkUserAndFetchData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (
        !session ||
        session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL
      ) {
        router.push("/admin/login");
      } else {
        await fetchProducts();
        setLoading(false);
      }
    };
    checkUserAndFetchData();
  }, [router, supabase]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      setNotification({
        message: `Erro ao buscar produtos: ${error.message}`,
        type: "error",
      });
    } else if (data) {
      const statusOrder: ProductStatus[] = [
        "Em Produção",
        "Em Desenvolvimento",
        "Projeto Futuro",
      ];
      const sortedData = [...data].sort(
        (a, b) =>
          statusOrder.indexOf(a.status as ProductStatus) -
          statusOrder.indexOf(b.status as ProductStatus)
      );
      setProducts(sortedData as Product[]);
    }
  };

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";
    setFormData((prev) => ({
      ...prev,
      [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setLogoFile(e.target.files[0]);
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({ ...product, description: product.description || "" });
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData(initialFormData);
  };

  const handleDeleteClick = (product: Product) => setProductToDelete(product);

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
    setNotification(
      error
        ? { message: `Erro: ${error.message}`, type: "error" }
        : { message: "Produto apagado!", type: "success" }
    );
    setProductToDelete(null);
    await fetchProducts();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    let logoUrl = "logo_url" in formData ? formData.logo_url : "";
    if (logoFile) {
      const filePath = `public/${Date.now()}-${logoFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("product-logos")
        .upload(filePath, logoFile);
      if (uploadError) {
        setNotification({
          message: `Erro no upload: ${uploadError.message}`,
          type: "error",
        });
        setIsSubmitting(false);
        return;
      }
      logoUrl = supabase.storage.from("product-logos").getPublicUrl(filePath)
        .data.publicUrl;
    }

    const { id, ...dataToSave } = formData as Product;
    const productData = { ...dataToSave, logo_url: logoUrl };

    const { error } = editingProduct
      ? await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id)
      : await supabase.from("products").insert(productData);

    setNotification(
      error
        ? { message: `Erro: ${error.message}`, type: "error" }
        : { message: `Produto salvo!`, type: "success" }
    );
    if (!error) {
      await fetchProducts();
      handleCancelEdit();
    }
    setLogoFile(null);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      {productToDelete && (
        <ConfirmationModal
          item={productToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setProductToDelete(null)}
        />
      )}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Gestão</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-sm"
          >
            Sair
          </button>
        </header>

        {notification && (
          <NotificationBanner
            notification={notification}
            onDismiss={() => setNotification(null)}
          />
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 md:items-start">
              {/* Coluna da Esquerda */}
              <div className="space-y-6 flex flex-col">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nome do Produto
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="slug"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slug para URL (ex: rescuenow)
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="slogan"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Slogan
                  </label>
                  <input
                    type="text"
                    id="slogan"
                    name="slogan"
                    value={formData.slogan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex-grow flex flex-col">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Descrição
                  </label>
                  <div className="flex-grow">
                    <RichTextEditor
                      key={editingProduct ? editingProduct.id : "new"}
                      value={formData.description}
                      onChange={handleDescriptionChange}
                      placeholder="Digite a descrição detalhada do produto..."
                    />
                  </div>
                </div>
              </div>

              {/* Coluna da Direita */}
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="type"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tipo
                  </label>
                  <select
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="saas">SaaS</option>
                    <option value="app">App</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status || "Em Produção"}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Em Produção">Em Produção</option>
                    <option value="Em Desenvolvimento">
                      Em Desenvolvimento
                    </option>
                    <option value="Projeto Futuro">Projeto Futuro</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="web_link"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Link da Web
                  </label>
                  <input
                    type="url"
                    id="web_link"
                    name="web_link"
                    value={formData.web_link || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="app_link"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Link do App
                  </label>
                  <input
                    type="url"
                    id="app_link"
                    name="app_link"
                    value={formData.app_link || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label
                    htmlFor="send_email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    E-mail para receber notificações
                  </label>
                  <input
                    type="email"
                    id="send_email"
                    name="send_email"
                    value={formData.send_email || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-6 mt-6 border-t">
              <fieldset>
                <legend className="text-base font-medium text-gray-900">
                  Otimização para SEO (Opcional)
                </legend>
                <div className="mt-4 space-y-6">
                  <div>
                    <label
                      htmlFor="seo_title"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Título para o Google (max 60 caracteres)
                    </label>
                    <input
                      type="text"
                      id="seo_title"
                      name="seo_title"
                      value={formData.seo_title || ""}
                      onChange={handleInputChange}
                      maxLength={60}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="seo_description"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Descrição para o Google (max 160 caracteres)
                    </label>
                    <textarea
                      id="seo_description"
                      name="seo_description"
                      value={formData.seo_description || ""}
                      onChange={handleInputChange}
                      rows={3}
                      maxLength={160}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>
              </fieldset>

              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    id="contact_form"
                    name="contact_form"
                    checked={formData.contact_form}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="contact_form"
                    className="font-medium text-gray-700"
                  >
                    Habilitar formulário de orçamento
                  </label>
                  <p className="text-gray-500">
                    Marque se o produto não tiver planos e necessitar de um
                    contacto para orçamento.
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="logo"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Logo do Produto (envie apenas se quiser alterar)
                </label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  onChange={handleFileChange}
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingProduct && formData.logo_url && (
                  <img
                    src={formData.logo_url}
                    alt="Logo atual"
                    className="h-16 mt-4 rounded-md"
                  />
                )}
              </div>
            </div>

            <div className="pt-5">
              <div className="flex justify-start">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 py-3 rounded-md text-white font-medium shadow-sm transition-colors bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isSubmitting
                    ? "Salvando..."
                    : editingProduct
                    ? "Atualizar Produto"
                    : "Salvar Produto"}
                </button>
                {editingProduct && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="ml-3 w-full md:w-auto px-6 py-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-2xl font-semibold text-gray-800">
              Produtos Existentes
            </h2>
          </div>
          <div className="p-6">
            {products.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhum produto encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between hover:shadow-xl transition-shadow bg-white"
                  >
                    <div className="flex-grow">
                      <div className="flex items-center mb-3">
                        {product.logo_url ? (
                          <img
                            src={product.logo_url}
                            alt={`${product.name} logo`}
                            className="h-12 w-12 mr-4 rounded-md object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 mr-4 rounded-md bg-gray-100 flex items-center justify-center text-gray-400">
                            ?
                          </div>
                        )}
                        <h3 className="text-base font-bold text-gray-900 leading-tight">
                          {product.name}
                        </h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        {/* O SecureHtmlRenderer agora é carregado dinamicamente */}
                        <SecureHtmlRenderer content={product.description} />
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-between pt-4 mt-4 border-t">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          product.status === "Em Produção"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {product.status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                          title="Editar"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                          title="Apagar"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}
