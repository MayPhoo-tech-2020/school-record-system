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

  const clearSearch = () => {
    setSearch("");
    setCurrentPage(1);
  };

  const hasFilters = Boolean(
    search ||
      region ||
      township ||
      schoolType ||
      schoolLevel ||
      classToBeTaught
  );

  const activeFilterCount = [
    region,
    township,
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

    if (type.toLowerCase().includes("international")) {
      return "bg-purple-100 text-purple-700";
    }

    if (type.toLowerCase().includes("college")) {
      return "bg-blue-100 text-blue-700";
    }

    if (type.toLowerCase().includes("higher")) {
      return "bg-orange-100 text-orange-700";
    }

    if (type.toLowerCase().includes("basic")) {
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
    const end = Math.min(totalPages - 1, currentPage + 1);

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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link
                href="/moe"
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 transition hover:text-blue-700"
              >
                ← Back to MOE
              </Link>

              <div className="mt-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    MOE School Records
                  </h1>

                  {!loading && !error && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {schools.length.toLocaleString()} Records
                    </span>
                  )}
                </div>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  Search and manage school records from the Ministry of
                  Education.
                </p>
              </div>
            </div>

            <Link
              href="/moe/import"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:w-auto"
            >
              <span className="text-base">📥</span>
              Import More Data
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Loading */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-900">
              Loading school records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Please wait while the MOE data is being loaded.
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-lg">
                !
              </div>

              <div>
                <h2 className="font-semibold text-red-900">
                  Unable to load school data
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Search & Filters */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-4 py-5 sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-lg">
                        🔎
                      </div>

                      <h2 className="text-lg font-semibold text-slate-900">
                        Search & Filters
                      </h2>
                    </div>

                    <p className="mt-2 text-sm text-slate-500">
                      Find schools by name, address, location, or school
                      information.
                    </p>
                  </div>

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="self-start rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 sm:self-auto"
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-6">
                {/* Search */}
                <div>
                  <label
                    htmlFor="search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search School
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                      <svg
                        className="h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <circle cx="11" cy="11" r="7" />
                        <path d="m20 20-4-4" />
                      </svg>
                    </div>

                    <input
                      id="search"
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search school name or address..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3.5 pl-11 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    {search && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        aria-label="Clear search"
                        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-700"
                      >
                        <span className="text-xl leading-none">
                          ×
                        </span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                  {/* Region */}
                  <div>
                    <label
                      htmlFor="region"
                      className="mb-2 block text-sm font-semibold text-slate-700"
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
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Township
                    </label>

                    <select
                      id="township"
                      value={township}
                      onChange={(e) => setTownship(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      School Type
                    </label>

                    <select
                      id="schoolType"
                      value={schoolType}
                      onChange={(e) =>
                        setSchoolType(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Allowed School Level
                    </label>

                    <select
                      id="schoolLevel"
                      value={schoolLevel}
                      onChange={(e) =>
                        setSchoolLevel(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
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
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Class to Be Taught
                    </label>

                    <select
                      id="classToBeTaught"
                      value={classToBeTaught}
                      onChange={(e) =>
                        setClassToBeTaught(e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-700 outline-none transition hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">All Classes</option>

                      {classes.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Active Filters */}
                {hasFilters && (
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                    <span className="mr-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Active filters
                    </span>

                    {search && (
                      <button
                        type="button"
                        onClick={clearSearch}
                        className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        Search: {search}
                        <span className="text-sm">×</span>
                      </button>
                    )}

                    {region && (
                      <button
                        type="button"
                        onClick={() => {
                          setRegion("");
                          setTownship("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        {region}
                        <span className="text-sm">×</span>
                      </button>
                    )}

                    {township && (
                      <button
                        type="button"
                        onClick={() => setTownship("")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        {township}
                        <span className="text-sm">×</span>
                      </button>
                    )}

                    {schoolType && (
                      <button
                        type="button"
                        onClick={() => setSchoolType("")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        {schoolType}
                        <span className="text-sm">×</span>
                      </button>
                    )}

                    {schoolLevel && (
                      <button
                        type="button"
                        onClick={() => setSchoolLevel("")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        {schoolLevel}
                        <span className="text-sm">×</span>
                      </button>
                    )}

                    {classToBeTaught && (
                      <button
                        type="button"
                        onClick={() => setClassToBeTaught("")}
                        className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-200"
                      >
                        {classToBeTaught}
                        <span className="text-sm">×</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Result Summary */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Total Records
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {schools.length.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-xl">
                    🏫
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Matching Schools
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {filteredSchools.length.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-xl">
                    ✓
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Active Filters
                    </p>

                    <p className="mt-1 text-2xl font-bold text-slate-900">
                      {activeFilterCount}
                    </p>
                  </div>

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-xl">
                    ⚙️
                  </div>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
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
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
                  Showing{" "}
                  <span className="font-semibold text-slate-700">
                    {startRecord.toLocaleString()}–
                    {endRecord.toLocaleString()}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-700">
                    {filteredSchools.length.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* No Results */}
            {filteredSchools.length === 0 && (
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm sm:p-16">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-3xl">
                  🔍
                </div>

                <h2 className="mt-5 text-lg font-bold text-slate-900">
                  No schools found
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  No school records match your current search and
                  filter settings. Try changing the filters or search
                  term.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Desktop / Tablet Table */}
            {filteredSchools.length > 0 && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-white px-4 py-3 sm:px-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-600">
                      Page {currentPage.toLocaleString()} of{" "}
                      {totalPages.toLocaleString()}
                    </p>

                    <p className="text-xs text-slate-400">
                      50 records per page
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[1450px] w-full border-collapse text-sm">
                    <thead className="sticky top-[89px] z-10">
                      <tr className="border-b border-slate-200 bg-slate-100 text-left">
                        <th className="w-16 whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          #
                        </th>

                        <th className="w-[260px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          School Name
                        </th>

                        <th className="w-[180px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Region / State
                        </th>

                        <th className="w-[170px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Township
                        </th>

                        <th className="w-[190px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          School Type
                        </th>

                        <th className="w-[220px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Allowed School Level
                        </th>

                        <th className="w-[180px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Class to Be Taught
                        </th>

                        <th className="w-[350px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          School Address
                        </th>

                        <th className="w-[220px] whitespace-nowrap px-4 py-4 text-xs font-bold uppercase tracking-wide text-slate-500">
                          Opening Period
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
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
                            className="group transition hover:bg-blue-50/50"
                          >
                            <td className="whitespace-nowrap px-4 py-4 align-top text-sm font-medium text-slate-400">
                              {rowNumber}
                            </td>

                            <td className="px-4 py-4 align-top">
                              <div className="max-w-[250px]">
                                <p
                                  className="font-semibold leading-5 text-slate-900"
                                  title={school.schoolName}
                                >
                                  {school.schoolName || "-"}
                                </p>
                              </div>
                            </td>

                            <td className="px-4 py-4 align-top text-slate-600">
                              {regionName || "-"}
                            </td>

                            <td className="px-4 py-4 align-top text-slate-600">
                              {townshipName || "-"}
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
                                <span className="text-slate-400">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4 align-top text-slate-600">
                              {school.allowedSchoolLevel || "-"}
                            </td>

                            <td className="px-4 py-4 align-top">
                              {school.classToBeTaught ? (
                                <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-700">
                                  {school.classToBeTaught}
                                </span>
                              ) : (
                                <span className="text-slate-400">
                                  -
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-4 align-top text-slate-600">
                              <p
                                className="max-w-[330px] leading-5"
                                title={school.schoolAddress || ""}
                              >
                                {school.schoolAddress || "-"}
                              </p>
                            </td>

                            <td className="px-4 py-4 align-top text-slate-600">
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
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <p className="text-sm text-slate-500">
                        Page{" "}
                        <span className="font-semibold text-slate-700">
                          {currentPage.toLocaleString()}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-slate-700">
                          {totalPages.toLocaleString()}
                        </span>
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.max(1, page - 1)
                            )
                          }
                          disabled={currentPage === 1}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          ← Previous
                        </button>

                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((page, index) => {
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
                                  setCurrentPage(page as number)
                                }
                                className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                                  currentPage === page
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            setCurrentPage((page) =>
                              Math.min(totalPages, page + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Next →
                        </button>
                      </div>
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