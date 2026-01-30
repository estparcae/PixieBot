import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-white to-orange-50" />

        <div className="relative max-w-6xl mx-auto px-6 py-20">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-400 to-orange-400" />
            <span className="text-xl font-semibold text-gray-900">Camaral</span>
          </div>

          {/* Hero content */}
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Avatares de IA para{" "}
              <span className="bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
                reuniones de ventas
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Automatiza tus reuniones con avatares inteligentes que hablan, escuchan
              y responden como humanos. Disponibles 24/7 en Zoom, Teams y Meet.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="https://calendly.com/emmsarias13/30min"
                className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white font-semibold rounded-full hover:shadow-lg hover:shadow-rose-500/25 transition-all"
              >
                Agendar demo
              </Link>
              <Link
                href="https://t.me/camaral_info_bot"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
              >
                💬 Hablar con el bot
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-16">
            ¿Cómo funciona?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              number="01"
              title="Crea tu avatar"
              description="Configura tu avatar con la información de tu empresa, productos y guiones de ventas."
            />
            <FeatureCard
              number="02"
              title="Conecta tu calendario"
              description="El avatar se une automáticamente a las reuniones programadas en Zoom, Teams o Meet."
            />
            <FeatureCard
              number="03"
              title="Escala tu equipo"
              description="Atiende cientos de reuniones simultáneas, 24/7, sin contratar más personal."
            />
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Casos de uso
          </h2>
          <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto">
            Empresas de todos los tamaños usan Camaral para automatizar sus interacciones
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <UseCaseCard
              icon="🎯"
              title="Ventas"
              description="Califica leads y realiza demos iniciales"
            />
            <UseCaseCard
              icon="🎧"
              title="Soporte"
              description="Atiende consultas y resuelve dudas 24/7"
            />
            <UseCaseCard
              icon="📚"
              title="Onboarding"
              description="Capacita clientes y empleados"
            />
            <UseCaseCard
              icon="👥"
              title="Reclutamiento"
              description="Realiza entrevistas iniciales"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">
            Precios
          </h2>
          <p className="text-gray-600 text-center mb-16">
            Planes flexibles que crecen con tu negocio
          </p>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PricingCard
              name="Pro"
              price="$99"
              minutes="500"
              extra="$0.24"
              features={["Avatares ilimitados", "Transcripciones", "API access"]}
            />
            <PricingCard
              name="Scale"
              price="$299"
              minutes="1,600"
              extra="$0.23"
              features={["Todo en Pro", "Integraciones custom", "Analíticas avanzadas"]}
              highlighted
            />
            <PricingCard
              name="Growth"
              price="$799"
              minutes="3,600"
              extra="$0.22"
              features={["Todo en Scale", "Soporte dedicado", "SLA garantizado"]}
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-rose-500 to-orange-500">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            ¿Listo para escalar tus ventas?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Agenda una demo y descubre cómo Camaral puede transformar tu negocio
          </p>
          <Link
            href="https://calendly.com/emmsarias13/30min"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Agendar demo gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-rose-400 to-orange-400" />
            <span className="text-white font-semibold">Camaral</span>
          </div>
          <p className="text-gray-400 text-sm">
            © 2025 Camaral. Avatares de IA para reuniones.
          </p>
          <Link
            href="https://t.me/camaral_info_bot"
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
            Bot de Telegram →
          </Link>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors">
      <span className="text-4xl font-bold bg-gradient-to-r from-rose-500 to-orange-500 bg-clip-text text-transparent">
        {number}
      </span>
      <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function UseCaseCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 rounded-xl bg-white border border-gray-200 hover:border-rose-200 hover:shadow-lg hover:shadow-rose-500/5 transition-all">
      <span className="text-3xl">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-900 mt-3 mb-1">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  minutes,
  extra,
  features,
  highlighted = false,
}: {
  name: string;
  price: string;
  minutes: string;
  extra: string;
  features: string[];
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-8 rounded-2xl ${
        highlighted
          ? "bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-xl shadow-rose-500/25"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <h3 className={`text-lg font-semibold ${highlighted ? "text-white" : "text-gray-900"}`}>
        {name}
      </h3>
      <div className="mt-4 mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className={highlighted ? "text-white/80" : "text-gray-500"}>/mes</span>
      </div>
      <p className={`text-sm mb-6 ${highlighted ? "text-white/80" : "text-gray-600"}`}>
        {minutes} min incluidos · {extra}/min extra
      </p>
      <ul className="space-y-3">
        {features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 text-sm">
            <span className={highlighted ? "text-white" : "text-rose-500"}>✓</span>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
