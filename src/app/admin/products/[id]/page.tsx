// src/app/admin/products/[id]/page.tsx
"use client";

import { useEffect, useState, FormEvent, ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Pencil, Trash2, X } from "lucide-react";

// --- Tipos e Dados Iniciais ---
type Plan = {
  id: number;
  product_id: number;
  name: string;
  price: number;
  description: string;
  features: string[];
  stripe_price_id: string | null;
  is_featured?: boolean; // Adicionado para consistência
};

type Notification = {
  message: string;
  type: "success" | "error";
};

const initialPlanData: Omit<Plan, "id" | "product_id"> = {
  name: "",
  price: 0,
  description: "",
  features: [],
  stripe_price_id: "",
};

// --- Componentes de UI Reutilizáveis ---

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
  item: Plan;
  onConfirm: () => void;
  onCancel: () => void;
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
      <h3 className="text-2xl font-bold text-gray-800">Confirmar Exclusão</h3>
      <p className="my-4 text-gray-600">
        Tem a certeza de que quer apagar o plano{" "}
        <strong className="text-red-600">{item.name}</strong>?
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
export default function ManagePlansPage() {
  const params = useParams();
  const productId = Number(params.id);
  const router = useRouter();

  const [productName, setProductName] = useState("");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [formData, setFormData] =
    useState<Omit<Plan, "id" | "product_id">>(initialPlanData);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notification | null>(null);
  const [planToDelete, setPlanToDelete] = useState<Plan | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProductAndPlans = async () => {
      const { data: productData } = await supabase
        .from("products")
        .select("name")
        .eq("id", productId)
        .single();
      if (productData) setProductName(productData.name);

      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .eq("product_id", productId)
        .order("price");
      if (plansData) setPlans(plansData as Plan[]);
    };
    fetchProductAndPlans();
  }, [productId]);

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "features") {
      setFormData({ ...formData, features: value.split("\n") });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEditClick = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData(plan);
    window.scrollTo(0, 0);
  };

  const handleCancelEdit = () => {
    setEditingPlan(null);
    setFormData(initialPlanData);
  };

  const handleDeleteClick = (plan: Plan) => {
    setPlanToDelete(plan);
  };

  const confirmDelete = async () => {
    if (!planToDelete) return;
    const { error } = await supabase
      .from("plans")
      .delete()
      .eq("id", planToDelete.id);
    if (error) {
      setNotification({
        message: `Erro ao apagar o plano: ${error.message}`,
        type: "error",
      });
    } else {
      setNotification({
        message: "Plano apagado com sucesso!",
        type: "success",
      });
      setPlans(plans.filter((p) => p.id !== planToDelete.id));
    }
    setPlanToDelete(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setNotification(null);

    const planData = {
      ...formData,
      product_id: productId,
      price: Number(formData.price),
    };

    let error;
    if (editingPlan) {
      const { error: updateError } = await supabase
        .from("plans")
        .update(planData)
        .eq("id", editingPlan.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase
        .from("plans")
        .insert(planData);
      error = insertError;
    }

    if (error) {
      setNotification({
        message: "Erro ao salvar plano: " + error.message,
        type: "error",
      });
    } else {
      setNotification({ message: "Plano salvo com sucesso!", type: "success" });
      const { data } = await supabase
        .from("plans")
        .select("*")
        .eq("product_id", productId)
        .order("price");
      if (data) setPlans(data as Plan[]);
      handleCancelEdit();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      {planToDelete && (
        <ConfirmationModal
          item={planToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPlanToDelete(null)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/admin")}
          className="mb-4 text-blue-600 hover:underline"
        >
          &larr; Voltar para Produtos
        </button>
        <h1 className="text-3xl font-bold mb-2">
          Gerir Planos para:{" "}
          <span className="text-blue-600">{productName}</span>
        </h1>

        {notification && (
          <NotificationBanner
            notification={notification}
            onDismiss={() => setNotification(null)}
          />
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4"
        >
          <h2 className="text-2xl font-semibold">
            {editingPlan ? "A Editar Plano" : "Adicionar Novo Plano"}
          </h2>
          <input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Nome do Plano (ex: Starter)"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            step="0.01"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="Preço (ex: 29.90)"
            className="w-full p-2 border rounded"
            required
          />
          <input
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descrição curta"
            className="w-full p-2 border rounded"
          />
          <textarea
            name="features"
            value={formData.features.join("\n")}
            onChange={handleInputChange}
            placeholder="Funcionalidades (uma por linha)"
            className="w-full p-2 border rounded h-24"
          />
          <input
            name="stripe_price_id"
            value={formData.stripe_price_id ?? ""}
            onChange={handleInputChange}
            placeholder="ID do Preço no Stripe (opcional)"
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting
                ? "A salvar..."
                : editingPlan
                  ? "Atualizar Plano"
                  : "Salvar Plano"}
            </button>
            {editingPlan && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Planos Existentes</h2>
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-bold text-xl">
                    {plan.name} - R$ {plan.price.toFixed(2)}
                  </h3>
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditClick(plan)}
                    className="p-2 hover:bg-gray-200 rounded-full"
                    title="Editar Plano"
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(plan)}
                    className="p-2 hover:bg-red-100 rounded-full text-red-600"
                    title="Apagar Plano"
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
