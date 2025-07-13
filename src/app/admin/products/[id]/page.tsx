    // src/app/admin/products/[id]/page.tsx
    'use client';

    import { useEffect, useState } from 'react';
    import { useParams, useRouter } from 'next/navigation';
    import { supabase } from '@/lib/supabase';
    import { Pencil, Trash2 } from 'lucide-react';

    type Plan = {
      id?: number;
      product_id: number;
      name: string;
      price: number;
      description: string;
      features: string[];
      stripe_price_id: string | null;
    };

    const initialPlanData: Omit<Plan, 'product_id'> = { name: '', price: 0, description: '', features: [], stripe_price_id: '' };

    export default function ManagePlansPage() {
      const params = useParams();
      const productId = Number(params.id);
      const router = useRouter();

      const [productName, setProductName] = useState('');
      const [plans, setPlans] = useState<Plan[]>([]);
      const [formData, setFormData] = useState(initialPlanData);
      const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

      useEffect(() => {
        if (!productId) return;
        
        const fetchProductAndPlans = async () => {
          // Busca o nome do produto
          const { data: productData } = await supabase.from('products').select('name').eq('id', productId).single();
          if (productData) setProductName(productData.name);

          // Busca os planos associados
          const { data: plansData } = await supabase.from('plans').select('*').eq('product_id', productId);
          if (plansData) setPlans(plansData as Plan[]);
        };
        fetchProductAndPlans();
      }, [productId]);

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'features') {
          setFormData({ ...formData, features: value.split('\n') });
        } else {
          setFormData({ ...formData, [name]: value });
        }
      };
      
      const handleEditClick = (plan: Plan) => {
        setEditingPlan(plan);
        setFormData(plan);
      };

      const handleCancelEdit = () => {
        setEditingPlan(null);
        setFormData(initialPlanData);
      };

      const handleDelete = async (planId: number) => {
        if (window.confirm('Tem a certeza?')) {
          await supabase.from('plans').delete().eq('id', planId);
          setPlans(plans.filter(p => p.id !== planId));
        }
      };

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const planData = { ...formData, product_id: productId };
        
        let error;
        if (editingPlan) {
          const { id, ...updateData } = planData;
          const { error: updateError } = await supabase.from('plans').update(updateData).eq('id', editingPlan.id);
          error = updateError;
        } else {
          const { id, ...insertData } = planData;
          const { error: insertError } = await supabase.from('plans').insert(insertData);
          error = insertError;
        }
        
        if (error) alert('Erro ao salvar plano: ' + error.message);
        else {
          alert('Plano salvo com sucesso!');
          const { data } = await supabase.from('plans').select('*').eq('product_id', productId);
          if (data) setPlans(data as Plan[]);
          handleCancelEdit();
        }
      };

      return (
        <div className="min-h-screen bg-gray-100 p-8">
          <div className="max-w-4xl mx-auto">
            <button onClick={() => router.push('/admin')} className="mb-4 text-primaria hover:underline">&larr; Voltar para Produtos</button>
            <h1 className="text-3xl font-bold mb-2">Gerir Planos para: {productName}</h1>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-8 space-y-4">
              <h2 className="text-2xl font-semibold">{editingPlan ? 'A Editar Plano' : 'Adicionar Novo Plano'}</h2>
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nome do Plano (ex: Starter)" className="w-full p-2 border rounded" required />
              <input type="number" step="0.01" name="price" value={formData.price} onChange={handleInputChange} placeholder="Preço (ex: 29.90)" className="w-full p-2 border rounded" required />
              <input name="description" value={formData.description} onChange={handleInputChange} placeholder="Descrição curta" className="w-full p-2 border rounded" />
              <textarea name="features" value={formData.features.join('\n')} onChange={handleInputChange} placeholder="Funcionalidades (uma por linha)" className="w-full p-2 border rounded h-24" />
              <input name="stripe_price_id" value={formData.stripe_price_id ?? ''} onChange={handleInputChange} placeholder="ID do Preço no Stripe (opcional)" className="w-full p-2 border rounded" />
              <div className="flex gap-4">
                <button type="submit" className="w-full bg-primaria text-white font-bold py-3 rounded-lg">{editingPlan ? 'Atualizar Plano' : 'Salvar Plano'}</button>
                {editingPlan && <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-500 text-white font-bold py-3 rounded-lg">Cancelar</button>}
              </div>
            </form>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Planos Existentes</h2>
              <div className="space-y-4">
                {plans.map(plan => (
                  <div key={plan.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-xl">{plan.name} - R$ {plan.price}</h3>
                      <p className="text-sm text-gray-600">{plan.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleEditClick(plan)} className="p-2 hover:bg-gray-200 rounded-full"><Pencil size={18} /></button>
                      <button onClick={() => handleDelete(plan.id!)} className="p-2 hover:bg-red-100 rounded-full text-red-600"><Trash2 size={18} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }
    