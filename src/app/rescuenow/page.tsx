import { STRIPE_PRICES, PLANS_METADATA } from '@/lib/stripe-config'
import { useRouter } from 'next/navigation'

export default function RescueNowPage() {
  const router = useRouter()

  const handlePlanSelect = (planType: string) => {
    const priceId = STRIPE_PRICES.rescuenow[planType as keyof typeof STRIPE_PRICES.rescuenow]
    router.push(`/signup?produto=rescuenow&plano=${planType}&priceId=${priceId}`)
  }

  return (
    <div>
      {/* Tabela de preços */}
      <div className="grid md:grid-cols-3 gap-6">
        {Object.entries(PLANS_METADATA.rescuenow).map(([planType, plan]) => (
          <div key={planType} className="border rounded-lg p-6">
            <h3 className="text-xl font-bold">{plan.name}</h3>
            <p className="text-2xl font-bold text-blue-600">{plan.price}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button 
              onClick={() => handlePlanSelect(planType)}
              className="w-full mt-6 bg-blue-600 text-white py-2 px-4 rounded"
            >
              Escolher {plan.name}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
