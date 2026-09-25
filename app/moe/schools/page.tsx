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
  const [schoolType, setSchoolType] = useState("");
  const [schoolLevel, setSchoolLevel] = useState("");
  const [classToBeTaught, setClassToBeTaught] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSchool, setSelectedSchool] =
    useState<School | null>(null);

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
      const matchesSearch =
        !searchText ||
        school.schoolName
          .toLowerCase()
          .includes(searchText) ||
        (school.schoolAddress || "")
          .toLowerCase()
          .includes(searchText);

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
        matchesSchoolType &&
        matchesSchoolLevel &&
        matchesClass
      );
    });
  }, [
    schools,
    search,
    schoolType,
    schoolLevel,
    classToBeTaught,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredSchools.length / RECORDS_PER_PAGE
    )
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
    setSchoolType("");
    setSchoolLevel("");
    setClassToBeTaught("");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(
    search ||
      schoolType ||
      schoolLevel ||
      classToBeTaught
  );

  const activeFilterCount = [
    schoolType,
    schoolLevel,
    classToBeTaught,
  ].filter(Boolean).length;

  const startRecord =
    filteredSchools.length === 0
      ? 0
      : (currentPage - 1) * RECORDS_PER_PAGE + 1;

  const endRecord = Math.min(
    currentPage * RECORDS_PER_PAGE,
    filteredSchools.length
  );

  const getSchoolTypeBadge = (type: string) => {
    if (!type) {
      return "bg-gray-100 text-gray-600";
    }

    const value = type.toLowerCase();

    if (value.includes("international")) {
      return "bg-purple-100 text-purple-700";
    }

    if (value.includes("college")) {
      return "bg-blue-100 text-blue-700";
    }

    if (value.includes("higher")) {
      return "bg-orange-100 text-orange-700";
    }

    if (value.includes("basic")) {
      return "bg-green-100 text-green-700";
    }

    return "bg-gray-100 text-gray-700";
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 3) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Link
                href="/moe"
                className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                ← Back to MOE
              </Link>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  MOE School Records
                </h1>

                {!loading && !error && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {schools.length.toLocaleString()} Records
                  </span>
                )}
              </div>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Search and manage school records from the Ministry
                of Education.
              </p>
            </div>

            <Link
              href="/moe/import"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
            >
              📥 Import More Data
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

            <h2 className="mt-4 font-semibold text-slate-900">
              Loading school records...
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait.
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-900">
              Unable to load school data
            </h2>

            <p className="mt-1 text-sm text-red-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* SEARCH & FILTERS */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-lg">
                        🔎
                      </span>

                      <h2 className="text-lg font-semibold text-slate-900">
                        Search & Filters
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Search by school name or address and narrow
                      the results using filters.
                    </p>
                  </div>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                    >
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* SEARCH */}
                <div>
                  <label
                    htmlFor="search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search School
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      🔍
                    </span>

                    <input
                      id="search"
                      type="text"
                      value={search}
                      onChange={(e) =>
                        setSearch(e.target.value)
                      }
                      placeholder="Search school name or address..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* FILTERS */}
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <FilterSelect
                    id="schoolType"
                    label="School Type"
                    value={schoolType}
                    onChange={setSchoolType}
                    options={schoolTypes}
                    placeholder="All School Types"
                  />

                  <FilterSelect
                    id="schoolLevel"
                    label="Allowed School Level"
                    value={schoolLevel}
                    onChange={setSchoolLevel}
                    options={schoolLevels}
                    placeholder="All School Levels"
                  />

                  <FilterSelect
                    id="classToBeTaught"
                    label="Class to Be Taught"
                    value={classToBeTaught}
                    onChange={setClassToBeTaught}
                    options={classes}
                    placeholder="All Classes"
                  />
                </div>

                {activeFilterCount > 0 && (
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                      {activeFilterCount} active filter
                      {activeFilterCount === 1 ? "" : "s"}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* SUMMARY */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Total Records
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {schools.length.toLocaleString()}
                  </p>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                    🏫
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Matching Schools
                </p>

                <div className="mt-2 flex items-center justify-between">
                  <p className="text-2xl font-bold text-slate-900">
                    {filteredSchools.length.toLocaleString()}
                  </p>

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                    ✓
                  </span>
                </div>
              </div>
            </div>

            {/* SCHOOL RECORDS */}
            <div className="mt-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    School Records
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {filteredSchools.length.toLocaleString()} school
                    {filteredSchools.length === 1 ? "" : "s"} found
                  </p>
                </div>

                {filteredSchools.length > 0 && (
                  <p className="text-sm text-slate-500">
                    Showing{" "}
                    <span className="font-semibold text-slate-700">
                      {startRecord.toLocaleString()}–
                      {endRecord.toLocaleString()}
                    </span>
                  </p>
                )}
              </div>

              {filteredSchools.length === 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                    🔍
                  </div>

                  <h3 className="mt-4 font-semibold text-slate-900">
                    No schools found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or filters.
                  </p>

                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* DESKTOP TABLE */}
              {filteredSchools.length > 0 && (
                <div className="mt-4 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left">
                          <th className="w-16 px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                            #
                          </th>

                          <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                            School Name
                          </th>

                          <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                            School Type
                          </th>

                          <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Allowed School Level
                          </th>

                          <th className="px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                            Class to Be Taught
                          </th>

                          <th className="w-24 px-4 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500">
                            Action
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-slate-100">
                        {paginatedSchools.map(
                          (school, index) => {
                            const rowNumber =
                              (currentPage - 1) *
                                RECORDS_PER_PAGE +
                              index +
                              1;

                            return (
                              <tr
                                key={school.id}
                                className="transition hover:bg-blue-50/50"
                              >
                                <td className="px-4 py-4 align-top text-slate-400">
                                  {rowNumber}
                                </td>

                                <td className="max-w-[350px] px-4 py-4 align-top">
                                  <p
                                    className="font-semibold leading-5 text-slate-900"
                                    title={school.schoolName}
                                  >
                                    {school.schoolName || "-"}
                                  </p>
                                </td>

                                <td className="px-4 py-4 align-top">
                                  {school.schoolType ? (
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getSchoolTypeBadge(
                                        school.schoolType
                                      )}`}
                                    >
                                      {school.schoolType}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>

                                <td className="max-w-[250px] px-4 py-4 align-top text-slate-600">
                                  {school.allowedSchoolLevel ||
                                    "-"}
                                </td>

                                <td className="px-4 py-4 align-top">
                                  {school.classToBeTaught ? (
                                    <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                                      {school.classToBeTaught}
                                    </span>
                                  ) : (
                                    "-"
                                  )}
                                </td>

                                <td className="px-4 py-4 text-right align-top">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setSelectedSchool(
                                        school
                                      )
                                    }
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                                  >
                                    View
                                  </button>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* MOBILE CARDS */}
              {filteredSchools.length > 0 && (
                <div className="mt-4 space-y-3 md:hidden">
                  {paginatedSchools.map(
                    (school, index) => {
                      const rowNumber =
                        (currentPage - 1) *
                          RECORDS_PER_PAGE +
                        index +
                        1;

                      return (
                        <div
                          key={school.id}
                          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-slate-400">
                                  #{rowNumber}
                                </span>

                                {school.schoolType && (
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${getSchoolTypeBadge(
                                      school.schoolType
                                    )}`}
                                  >
                                    {school.schoolType}
                                  </span>
                                )}
                              </div>

                              <h3 className="mt-2 font-semibold leading-5 text-slate-900">
                                {school.schoolName || "-"}
                              </h3>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                setSelectedSchool(school)
                              }
                              className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white"
                            >
                              View
                            </button>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                School Type
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {school.schoolType || "-"}
                              </p>
                            </div>

                            <div>
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Class
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {school.classToBeTaught || "-"}
                              </p>
                            </div>

                            <div className="col-span-2">
                              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                Allowed School Level
                              </p>

                              <p className="mt-1 text-sm text-slate-700">
                                {school.allowedSchoolLevel ||
                                  "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              )}

              {/* PAGINATION */}
              {filteredSchools.length > 0 &&
                totalPages > 1 && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                      <p className="text-sm text-slate-500">
                        Page{" "}
                        <span className="font-semibold text-slate-700">
                          {currentPage}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {totalPages}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.max(1, page - 1)
                            )
                          }
                          disabled={currentPage === 1}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ←
                        </button>

                        {getPageNumbers().map(
                          (page, index) => {
                            if (page === "...") {
                              return (
                                <span
                                  key={`dots-${index}`}
                                  className="px-2 text-sm text-slate-400"
                                >
                                  ...
                                </span>
                              );
                            }

                            return (
                              <button
                                key={page}
                                type="button"
                                onClick={() =>
                                  setCurrentPage(
                                    page as number
                                  )
                                }
                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white"
                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}

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
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          →
                        </button>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </>
        )}
      </section>

      {/* DETAIL MODAL */}
      {selectedSchool && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelectedSchool(null)}
        >
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl sm:max-w-2xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    School Details
                  </p>

                  <h2 className="mt-1 text-lg font-bold leading-6 text-slate-900 sm:text-xl">
                    {selectedSchool.schoolName || "-"}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSchool(null)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl text-slate-500 hover:bg-slate-200 hover:text-slate-800"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <DetailItem
                  label="School Type"
                  value={selectedSchool.schoolType}
                />

                <DetailItem
                  label="Allowed School Level"
                  value={
                    selectedSchool.allowedSchoolLevel
                  }
                />

                <DetailItem
                  label="Class to Be Taught"
                  value={selectedSchool.classToBeTaught}
                />

                <DetailItem
                  label="Opening Period"
                  value={selectedSchool.openingPeriod}
                />
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  School Address
                </p>

                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {selectedSchool.schoolAddress || "-"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSchool(null)}
                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        <option value="">{placeholder}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium leading-5 text-slate-800">
        {value || "-"}
      </p>
    </div>
  );
}
