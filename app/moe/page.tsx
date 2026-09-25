import Link from "next/link";

export default function MOEPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-800"
          >
            ← Back to Home
          </Link>

          <div className="mt-4 sm:mt-5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              MOE School Data
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Manage school data from the Ministry of Education source.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Import MOE Data */}
          <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl">
              📥
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              Import MOE Data
            </h2>

            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
              Import school records from an MOE data file into the school
              record system.
            </p>

            <Link
              href="/moe/import"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
            >
              Import MOE Data
            </Link>
          </div>

          {/* View MOE Schools */}
          <div className="group flex flex-col rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-2xl">
              🏫
            </div>

            <h2 className="mt-5 text-xl font-semibold text-gray-900">
              View MOE Schools
            </h2>

            <p className="mt-2 flex-1 text-sm leading-6 text-gray-600">
              Browse, search, and filter school records imported from the
              Ministry of Education.
            </p>

            <Link
              href="/moe/schools"
              className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.99]"
            >
              View MOE Schools
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}