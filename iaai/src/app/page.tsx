
import { ArrowRight, Cpu, Shield, Zap, BarChart3, Users, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-6 py-24 sm:px-6 sm:py-32 lg:px-8 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Zeropoint Protocol
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Real compute attestation and tinygrad integration for AI training and inference.
            No mocks, no synthetic data, only genuine hardware performance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a
              href="/control/overview"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Control Center
              <ArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </a>
            <a
              href="/docs"
              className="text-sm font-semibold leading-6 text-white"
            >
              Documentation <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">Real Compute</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need for AI training
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Built on tinygrad with ROCm integration, providing deterministic training, 
              hardware attestation, and comprehensive monitoring.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Cpu className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  tinygrad Integration
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Full tinygrad integration with ROCm on tinybox hardware. 
                    Real compute attestation with no mock implementations.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Shield className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Governance & Safety
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Comprehensive data governance, PII scanning, license validation, 
                    and safety testing with red-team validation.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <BarChart3 className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                  Live Monitoring
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Real-time metrics, consensus monitoring, and audit trails 
                    with live SSE/WebSocket data streaming.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 sm:py-32 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-600">
              Access the Control Center to monitor KPIs, Synthiants, Consensus, 
              Metrics, and Audit timelines in real-time.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a
                href="/control/overview"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                Enter Control Center
              </a>
              <a
                href="/docs"
                className="text-sm font-semibold leading-6 text-gray-900"
              >
                Learn more <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
