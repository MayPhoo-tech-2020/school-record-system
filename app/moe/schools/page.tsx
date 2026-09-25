"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type School = {
  id: number;
  schoolName: string;
  schoolAddress: string | null;
  openingPeriod: string | null;
  schoolType: string;
  allowedSchoolLevel: string;
  classToBeTaught: string;
};

const RECORDS_PER_PAGE = 50;

export default function MOESchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("");
  const [township, setTownship] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [classToBeTaught, setClassToBeTaught] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

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
          throw new Error(
            result.message || "Failed to fetch MOE schools"
          );
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

  /*
   * Extract Region / State from the address.
   *
   * Example:
   * "JMK 10/251, Jang Mai Kung, Myothit Gyi Ward,
   *  Myitkyina, Kachin State"
   *
   * becomes:
   * "Kachin State"
   */
  const getRegion = (address: string | null) => {
    if (!address) return "";

    const parts = address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    if (parts.length === 0) return "";

    const lastPart = parts[parts.length - 1];

    if (
      lastPart.toLowerCase().includes("region") ||
      lastPart.toLowerCase().includes("state")
    ) {
      return lastPart;
    }

    return "";
  };

  /*
   * Extract Township from the address.
   *
   * Example:
   * "... Monywa Township, Sagaing Region"
   *
   * becomes:
   * "Monywa Township"
   */
  const getTownship = (address: string | null) => {
    if (!address) return "";

    const parts = address
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    const townshipPart = parts.find((part) =>
      part.toLowerCase().includes("township")
    );

    return townshipPart || "";
  };

  const regions = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => getRegion(school.schoolAddress))
          .filter(Boolean)
      )
    ).sort();
  }, [schools]);

  const townships = useMemo(() => {
    let filteredSchools = schools;

    if (region) {
      filteredSchools = filteredSchools.filter(
        (school) => getRegion(school.schoolAddress) === region
      );
    }

    return Array.from(
      new Set(
        filteredSchools
          .map((school) => getTownship(school.schoolAddress))
          .filter(Boolean)
      )
    ).sort();
  }, [schools, region]);

  const schoolTypes = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => school.schoolType)
          .filter(Boolean)
      )
    ).sort();
  }, [schools]);

  const schoolLevels = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => school.allowedSchoolLevel)
          .filter(Boolean)
      )
    ).sort();
  }, [schools]);

  const classes = useMemo(() => {
    return Array.from(
      new Set(
        schools
          .map((school) => school.classToBeTaught)
          .filter(Boolean)
      )
    ).sort();
  }, [schools]);

  const filteredSchools = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return schools.filter((school) => {
      const schoolRegion = getRegion(school.schoolAddress);
      const schoolTownship = getTownship(school.schoolAddress);

      const matchesSearch =
        !searchText ||
        school.schoolName.toLowerCase().includes(searchText) ||
        (school.schoolAddress || "")
          .toLowerCase()
          .includes(searchText);

      const matchesRegion =
        !region || schoolRegion === region;

      const matchesTownship =
        !township || schoolTownship === township;

      const matchesSchoolType =
        !schoolType || school.schoolType === schoolType;

      const matchesSchoolLevel =
        !schoolLevel ||
        school.allowedSchoolLevel === schoolLevel;

      const matchesClass =
        !classToBeTaught ||
        school.classToBeTaught === classToBeTaught;

      return (
        matchesSearch &&
        matchesRegion &&
        matchesTownship &&
        matchesSchoolType &&
        matchesSchoolLevel &&
        matchesClass
      );
    });
  }, [
    schools,
    search,
    region,
    township,
    schoolType,
    schoolLevel,
    classToBeTaught,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredSchools.length / RECORDS_PER_PAGE)
  );

  const paginatedSchools = useMemo(() => {
    const startIndex =
      (currentPage - 1) * RECORDS_PER_PAGE;

    return filteredSchools.slice(
      startIndex,
      startIndex + RECORDS_PER_PAGE
    );
  }, [filteredSchools, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    region,
    township,
    schoolType,
    schoolLevel,
    classToBeTaught,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearch("");
    setRegion("");
    setTownship("");
    setSchoolType("");
    setSchoolLevel("");
    setClassToBeTaught("");
    setCurrentPage(1);
  };

  const hasFilters =
    search ||
    region ||
    township ||
    schoolType ||
    schoolLevel ||
    classToBeTaught;

  const startRecord =
    filteredSchools.length === 0
      ? 0
      : (currentPage - 1) * RECORDS_PER_PAGE + 1;

  const endRecord = Math.min(
    currentPage * RECORDS_PER_PAGE,
    filteredSchools.length
  );

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

          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                MOE School Records
              </h1>

              <p className="mt-2 text-gray-600">
                View, search, and filter imported Ministry of
                Education school records.
              </p>
            </div>

            <Link
              href="/moe/import"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Import More Data
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
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

        {/* Main */}
        {!loading && !error && (
          <>
            {/* Filters */}
            <div className="rounded-xl border bg-white p-6 shadow-sm">
              <div className="mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  Search & Filters
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Find schools by name, address, location, or
                  school information.
                </p>
              </div>

              {/* Search */}
              <div>
                <label
                  htmlFor="search"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Search
                </label>

                <input
                  id="search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search school name or address..."
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Filters */}
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Region */}
                <div>
                  <label
                    htmlFor="region"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Region / State
                  </label>

                  <select
                    id="region"
                    value={region}
                    onChange={(e) => {
                      setRegion(e.target.value);
                      setTownship("");
                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All Regions / States
                    </option>

                    {regions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Township */}
                <div>
                  <label
                    htmlFor="township"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Township
                  </label>

                  <select
                    id="township"
                    value={township}
                    onChange={(e) =>
                      setTownship(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All Townships
                    </option>

                    {townships.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* School Type */}
                <div>
                  <label
                    htmlFor="schoolType"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    School Type
                  </label>

                  <select
                    id="schoolType"
                    value={schoolType}
                    onChange={(e) =>
                      setSchoolType(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All School Types
                    </option>

                    {schoolTypes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* School Level */}
                <div>
                  <label
                    htmlFor="schoolLevel"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Allowed School Level
                  </label>

                  <select
                    id="schoolLevel"
                    value={schoolLevel}
                    onChange={(e) =>
                      setSchoolLevel(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All School Levels
                    </option>

                    {schoolLevels.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div>
                  <label
                    htmlFor="classToBeTaught"
                    className="mb-2 block text-sm font-medium text-gray-700"
                  >
                    Class to Be Taught
                  </label>

                  <select
                    id="classToBeTaught"
                    value={classToBeTaught}
                    onChange={(e) =>
                      setClassToBeTaught(e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">
                      All Classes
                    </option>

                    {classes.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    disabled={!hasFilters}
                    className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>

            {/* Result Summary */}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  School Records
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {filteredSchools.length.toLocaleString()} school
                  {filteredSchools.length === 1 ? "" : "s"} found
                </p>
              </div>

              {filteredSchools.length > 0 && (
                <p className="text-sm text-gray-500">
                  Showing {startRecord.toLocaleString()}–
                  {endRecord.toLocaleString()} of{" "}
                  {filteredSchools.length.toLocaleString()}
                </p>
              )}
            </div>

            {/* Empty */}
            {filteredSchools.length === 0 && (
              <div className="mt-4 rounded-xl border bg-white p-10 text-center shadow-sm">
                <div className="text-4xl">🔍</div>

                <h2 className="mt-4 text-lg font-semibold text-gray-900">
                  No schools found
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                  Try changing your search or filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Clear Filters
                </button>
              </div>
            )}

            {/* Table */}
            {filteredSchools.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-xl border bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[1300px] w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-100 text-left">
                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                          #
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                          School Name
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                          Region / State
                        </th>

                        <th className="whitespace-nowrap px-4 py-3 font-semibold text-gray-700">
                          Township
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
                      {paginatedSchools.map((school, index) => {
                        const regionName = getRegion(
                          school.schoolAddress
                        );

                        const townshipName = getTownship(
                          school.schoolAddress
                        );

                        const rowNumber =
                          (currentPage - 1) *
                            RECORDS_PER_PAGE +
                          index +
                          1;

                        return (
                          <tr
                            key={school.id}
                            className="border-b last:border-b-0 hover:bg-gray-50"
                          >
                            <td className="whitespace-nowrap px-4 py-4 text-gray-500">
                              {rowNumber}
                            </td>

                            <td className="max-w-xs px-4 py-4 font-medium text-gray-900">
                              {school.schoolName || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {regionName || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {townshipName || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {school.schoolType || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {school.allowedSchoolLevel || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {school.classToBeTaught || "-"}
                            </td>

                            <td className="max-w-md px-4 py-4 text-gray-700">
                              {school.schoolAddress || "-"}
                            </td>

                            <td className="whitespace-nowrap px-4 py-4 text-gray-700">
                              {school.openingPeriod || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col gap-4 border-t bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                      Page {currentPage.toLocaleString()} of{" "}
                      {totalPages.toLocaleString()}
                    </p>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.max(1, page - 1)
                          )
                        }
                        disabled={currentPage === 1}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        ← Previous
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPage((page) =>
                            Math.min(
                              totalPages,
                              page + 1
                            )
                          )
                        }
                        disabled={
                          currentPage === totalPages
                        }
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}