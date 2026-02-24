import { useNavigate } from "react-router-dom";
import { SectionHero, SectionDark } from "../components/sections";
import { Button } from "../components/ui/button";
import { plans } from "../constants";

function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      {/* Hero - Dark with Grid */}
      <SectionHero
        title="Simple, transparent pricing"
        subtitle="Pay only for what you use. No hidden fees. No contracts."
      />

      {/* Plans - Dark with Grid */}
      <SectionDark
        maxWidth="5xl"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-lg border ${
                plan.highlighted 
                  ? 'bg-[#fddf0d]/10 border-[#fddf0d] ring-2 ring-[#fddf0d]' 
                  : 'bg-white/5 border-gray-600'
              }`}
            >
              {plan.highlighted && (
                <div className="text-[#fddf0d] text-sm font-bold uppercase mb-4">
                  Most popular
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <div className="text-xl font-semibold text-white mb-2">{plan.price}</div>
              <p className="text-gray-300 mb-8">{plan.description}</p>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-[#fddf0d] mt-1">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.highlighted ? 'primary' : 'secondary'}
                className="w-full"
                onClick={() => plan.cta === "Get started" ? navigate("/register") : navigate("/contact")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </SectionDark>

    </div>
  );
}

export default Pricing;
