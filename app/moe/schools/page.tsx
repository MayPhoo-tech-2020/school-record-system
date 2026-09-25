"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type School = {
  id: number;
  schoolName: string;
  schoolAddress: string | null;
  openingPeriod: string | null;
  schoolType: string;
  allowedSchoolLevel: string;
  classToBeTaught: string;
};

export default function MOESchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchSchools() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/moe/schools");

        if (!response.ok) {
          throw new Error("Failed to fetch MOE schools");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Failed to fetch MOE schools");
        }

        setSchools(result.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load MOE school data.");
      } finally {
        setLoading(false);
      }
    }

    fetchSchools();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <Link
            href="/moe"
            className="text-sm font-medium text-blue-600 hover:text-blue-800"
          >
            ← Back to MOE
          </Link>

          <div className="mt-4">
            <h1 className="text-3xl font-bold text-gray-900">
              MOE School Records
            </h1>

            <p className="mt-2 text-gray-600">
              View all imported Ministry of Education school records.
            </p>
          </div>
        </div>
      </header>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-8">
        {/* Summary */}
        <div className="mb-6 rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                All Schools
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {loading
                  ? "Loading school records..."
                  : `${schools.length} school record${
                      schools.length === 1 ? "" : "s"
                    } found`}
              </p>
            </div>

            <Link
              href="/moe/import"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Import More Data
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

            <p className="mt-4 text-sm text-gray-600">
              Loading MOE school records...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              Unable to load data
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && schools.length === 0 && (
          <div className="rounded-xl border bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              No school records found
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Import MOE school data to see records here.
            </p>

            <Link
              href="/moe/import"
              className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Import
            </Link>
          </div>
        )}

        {/* Table */}
        {!loading && !error && schools.length > 0 && (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b bg-gray-100 text-left">
                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      #
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      School Name
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      School Type
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      Allowed School Level
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      Class to Be Taught
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      School Address
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                      Opening Period
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {schools.map((school, index) => (
                    <tr
                      key={school.id}
                      className="border-b last:border-b-0 hover:bg-gray-50"
                    >
                      <td className="px-4 py-4 text-gray-500">
                        {index + 1}
                      </td>

                      <td className="px-4 py-4 font-medium text-gray-900">
                        {school.schoolName || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {school.schoolType || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {school.allowedSchoolLevel || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {school.classToBeTaught || "-"}
                      </td>

                      <td className="max-w-md px-4 py-4 text-gray-700">
                        {school.schoolAddress || "-"}
                      </td>

                      <td className="px-4 py-4 text-gray-700">
                        {school.openingPeriod || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="border-t bg-gray-50 px-4 py-3">
              <p className="text-sm text-gray-500">
                Showing {schools.length} school
                {schools.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}