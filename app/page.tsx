"use client";

import { ChangeEvent, useEffect, useState } from "react";

type Institution = {
  id: number;
  name: string;
  type: string | null;
  address: string | null;
  region: string | null;
  township: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
  schoolLevel: string | null;
  classes: string | null;
  openingPeriod: string | null;
  sourceId: number | null;
};

export default function Home() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchInstitutions = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/institutions");
      const result = await response.json();

      if (result.success) {
        setInstitutions(result.data);
      } else {
        setMessage(result.message || "Failed to load data");
      }
    } catch (error) {
      console.error(error);
      setMessage("Failed to load institutions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] || null;

    if (selectedFile && !selectedFile.name.toLowerCase().endsWith(".csv")) {
      setMessage("Please select a CSV file.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage("");
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a CSV file first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/institutions/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setMessage(result.message || "CSV import failed.");
        return;
      }

      setMessage(`Successfully imported ${result.count} institution(s).`);
      setFile(null);

      const input = document.getElementById(
        "csv-file"
      ) as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }

      await fetchInstitutions();
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while uploading.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-[1800px]">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            School Record System
          </h1>
          <p className="mt-1 text-gray-600">
            Upload CSV and manage institution records.
          </p>
        </div>

        {/* Upload */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold">
            Import CSV
          </h2>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label
                htmlFor="csv-file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Select CSV File
              </label>

              <input
                id="csv-file"
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2"
              />

              {file && (
                <p className="mt-2 text-sm text-gray-600">
                  Selected: {file.name}
                </p>
              )}
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="rounded-md bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload CSV"}
            </button>
          </div>

          {message && (
            <div className="mt-4 rounded-md bg-gray-100 px-4 py-3 text-sm">
              {message}
            </div>
          )}
        </section>

        {/* Data */}
        <section className="rounded-lg bg-white shadow">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <div>
              <h2 className="text-xl font-semibold">
                All Institutions
              </h2>
              <p className="text-sm text-gray-500">
                Total: {institutions.length}
              </p>
            </div>

            <button
              onClick={fetchInstitutions}
              disabled={loading}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading...
            </div>
          ) : institutions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No institutions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Address</th>
                    <th className="px-4 py-3 text-left">Region</th>
                    <th className="px-4 py-3 text-left">Township</th>
                    <th className="px-4 py-3 text-left">Phone</th>
                    <th className="px-4 py-3 text-left">Email</th>
                    <th className="px-4 py-3 text-left">Website</th>
                    <th className="px-4 py-3 text-left">Latitude</th>
                    <th className="px-4 py-3 text-left">Longitude</th>
                    <th className="px-4 py-3 text-left">School Level</th>
                    <th className="px-4 py-3 text-left">Classes</th>
                    <th className="px-4 py-3 text-left">Opening Period</th>
                    <th className="px-4 py-3 text-left">Source ID</th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {institutions.map((institution) => (
                    <tr
                      key={institution.id}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-4 py-3">{institution.id}</td>

                      <td className="px-4 py-3 font-medium">
                        {institution.name}
                      </td>

                      <td className="px-4 py-3">
                        {institution.type || "-"}
                      </td>

                      <td className="min-w-[300px] px-4 py-3">
                        {institution.address || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.region || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.township || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.phone || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.email || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.website || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.latitude ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.longitude ?? "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.schoolLevel || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.classes || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.openingPeriod || "-"}
                      </td>

                      <td className="px-4 py-3">
                        {institution.sourceId ?? "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}