"use client";

import {
  ChangeEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type MOE = {
  id: number;
  schoolName: string | null;
  schoolAddress: string | null;
  openingPeriod: string | null;
  schoolTypeId: number | null;
  allowedSchoolLevelId: number | null;
  classToBeTaughtId: number | null;
  createdAt: string;
  updatedAt: string;
};

type UploadStage =
  | "idle"
  | "uploading"
  | "processing"
  | "success"
  | "error";

const ALLOWED_EXTENSIONS = [
  ".csv",
  ".xlsx",
  ".json",
];

export default function Home() {
  const [moes, setMoes] = useState<MOE[]>([]);

  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
    useState(0);

  const [uploadStage, setUploadStage] =
    useState<UploadStage>("idle");

  const [message, setMessage] =
    useState("");

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  /*
   * Load MOE records
   */
  const fetchMOE = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        "/api/moe",
        {
          cache: "no-store",
        }
      );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        setMessage(
          result.message ||
            "Failed to load MOE data."
        );

        return;
      }

      setMoes(result.data);
    } catch (error) {
      console.error(error);

      setMessage(
        "Failed to load MOE records."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMOE();
  }, []);

  /*
   * Check supported file
   */
  const isSupportedFile = (
    fileName: string
  ) => {
    const lowerName =
      fileName.toLowerCase();

    return ALLOWED_EXTENSIONS.some(
      (extension) =>
        lowerName.endsWith(extension)
    );
  };

  /*
   * Get file type
   */
  const getFileType = (
    fileName: string
  ) => {
    const lowerName =
      fileName.toLowerCase();

    if (
      lowerName.endsWith(".csv")
    ) {
      return "CSV";
    }

    if (
      lowerName.endsWith(".xlsx")
    ) {
      return "Excel";
    }

    if (
      lowerName.endsWith(".json")
    ) {
      return "JSON";
    }

    return "File";
  };

  /*
   * Select file
   */
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      event.target.files?.[0] ||
      null;

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (
      !isSupportedFile(
        selectedFile.name
      )
    ) {
      setMessage(
        "Unsupported file. Please select CSV, XLSX, or JSON."
      );

      setFile(null);

      event.target.value = "";

      return;
    }

    setFile(selectedFile);

    setMessage("");

    setUploadProgress(0);

    setUploadStage("idle");
  };

  /*
   * Reset selected file
   */
  const resetFile = () => {
    setFile(null);

    setUploadProgress(0);

    setUploadStage("idle");

    setMessage("");

    if (fileInputRef.current) {
      fileInputRef.current.value =
        "";
    }
  };

  /*
   * Upload file
   */
  const handleUpload = () => {
    if (!file) {
      setMessage(
        "Please select a CSV, XLSX, or JSON file first."
      );

      return;
    }

    setUploading(true);

    setUploadProgress(0);

    setUploadStage("uploading");

    setMessage("");

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const xhr =
      new XMLHttpRequest();

    xhr.open(
      "POST",
      "/api/moe/import"
    );

    /*
     * Browser upload progress
     */
    xhr.upload.addEventListener(
      "progress",
      (event) => {
        if (!event.lengthComputable) {
          return;
        }

        const percentage =
          Math.round(
            (event.loaded /
              event.total) *
              100
          );

        setUploadProgress(
          percentage
        );

        /*
         * 100% means browser
         * finished sending the file.
         *
         * Server may still be
         * inserting database records.
         */
        if (percentage >= 100) {
          setUploadStage(
            "processing"
          );
        }
      }
    );

    /*
     * Server response
     */
    xhr.addEventListener(
      "load",
      async () => {
        try {
          let result;

          try {
            result = JSON.parse(
              xhr.responseText
            );
          } catch {
            throw new Error(
              "Invalid server response."
            );
          }

          if (
            xhr.status < 200 ||
            xhr.status >= 300 ||
            !result.success
          ) {
            setUploadStage(
              "error"
            );

            setMessage(
              result.message ||
                "Import failed."
            );

            return;
          }

          setUploadProgress(100);

          setUploadStage(
            "success"
          );

          setMessage(
            `Successfully imported ${result.count} school(s).`
          );

          resetFile();

          await fetchMOE();
        } catch (error) {
          console.error(error);

          setUploadStage(
            "error"
          );

          setMessage(
            error instanceof Error
              ? error.message
              : "Something went wrong."
          );
        } finally {
          setUploading(false);
        }
      }
    );

    /*
     * Network error
     */
    xhr.addEventListener(
      "error",
      () => {
        setUploading(false);

        setUploadStage(
          "error"
        );

        setMessage(
          "Network error. The file could not be uploaded."
        );
      }
    );

    /*
     * Upload cancelled
     */
    xhr.addEventListener(
      "abort",
      () => {
        setUploading(false);

        setUploadStage(
          "error"
        );

        setMessage(
          "Upload was cancelled."
        );
      }
    );

    xhr.send(formData);
  };

  /*
   * Format date
   */
  const formatDate = (
    date: string
  ) => {
    return new Date(
      date
    ).toLocaleString();
  };

  return (
    <main className="min-h-screen bg-gray-50 p-6">

      {/* ========================================
          UPLOAD LOADING OVERLAY
          ======================================== */}

      {uploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">

          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

            <div className="flex flex-col items-center text-center">

              {/* Spinner */}
              <div className="mb-5 h-14 w-14 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              {/* Title */}
              <h2 className="text-xl font-bold text-gray-900">

                {uploadStage ===
                "processing"
                  ? "Processing Data"
                  : "Uploading File"}

              </h2>

              {/* Description */}
              <p className="mt-2 text-sm text-gray-500">

                {uploadStage ===
                "processing"
                  ? "Your file has been uploaded. We are saving the records to the database..."
                  : `Uploading ${getFileType(
                      file?.name || ""
                    )} file...`}

              </p>

              {/* Progress */}
              <div className="mt-6 w-full">

                <div className="mb-2 flex items-center justify-between text-sm">

                  <span className="font-medium text-gray-700">
                    {uploadStage ===
                    "processing"
                      ? "Processing"
                      : "Upload progress"}
                  </span>

                  <span className="font-semibold text-blue-600">
                    {uploadProgress}%
                  </span>

                </div>

                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                    }}
                  />

                </div>

              </div>

              {/* Warning */}
              <p className="mt-5 text-xs text-gray-400">
                Please do not close or refresh this page.
              </p>

            </div>

          </div>

        </div>
      )}

      {/* ========================================
          MAIN CONTENT
          ======================================== */}

      <div className="mx-auto max-w-[1800px]">

        {/* ======================================
            HEADER
            ====================================== */}

        <div className="mb-6">

          <h1 className="text-3xl font-bold text-gray-900">
            School Record System
          </h1>

          <p className="mt-1 text-gray-600">
            MOE school records management system.
          </p>

        </div>

        {/* ======================================
            IMPORT SECTION
            ====================================== */}

        <section className="mb-6 rounded-xl bg-white p-6 shadow">

          <div className="mb-5">

            <h2 className="text-xl font-semibold text-gray-900">
              Import MOE Data
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Upload school records using CSV, Excel, or JSON.
            </p>

          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">

            {/* File input */}
            <div className="flex-1">

              <label
                htmlFor="moe-file"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Select File
              </label>

              <input
                ref={fileInputRef}
                id="moe-file"
                type="file"
                accept=".csv,.xlsx,.json,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                onChange={
                  handleFileChange
                }
                disabled={uploading}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              {/* Selected file */}
              {file && (
                <div className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">

                  <div>

                    <p className="text-sm font-medium text-gray-800">
                      {file.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">

                      {getFileType(
                        file.name
                      )}

                      {" • "}

                      {(
                        file.size /
                        1024
                      ).toFixed(1)}

                      {" KB"}

                    </p>

                  </div>

                  {!uploading && (
                    <button
                      type="button"
                      onClick={
                        resetFile
                      }
                      className="text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}

                </div>
              )}

            </div>

            {/* Upload button */}
            <button
              type="button"
              onClick={
                handleUpload
              }
              disabled={
                !file ||
                uploading
              }
              className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading
                ? "Processing..."
                : "Upload File"}
            </button>

          </div>

          {/* Supported formats */}
          <div className="mt-4 rounded-lg bg-blue-50 px-4 py-3">

            <p className="text-sm text-blue-700">
              Supported formats:{" "}
              <strong>
                CSV, XLSX, JSON
              </strong>
            </p>

          </div>

          {/* Message */}
          {message &&
            !uploading && (
              <div
                className={`mt-4 rounded-lg px-4 py-3 text-sm ${
                  uploadStage ===
                  "error"
                    ? "bg-red-50 text-red-700"
                    : uploadStage ===
                        "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-gray-100 text-gray-700"
                }`}
              >
                {message}
              </div>
            )}

        </section>

        {/* ======================================
            MOE TABLE
            ====================================== */}

        <section className="rounded-xl bg-white shadow">

          {/* Table header */}
          <div className="flex items-center justify-between border-b px-6 py-4">

            <div>

              <h2 className="text-xl font-semibold text-gray-900">
                MOE Schools
              </h2>

              <p className="text-sm text-gray-500">
                Total:{" "}
                {moes.length}
              </p>

            </div>

            <button
              type="button"
              onClick={
                fetchMOE
              }
              disabled={
                loading ||
                uploading
              }
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Refresh
            </button>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 text-gray-500">

              <div className="mb-4 h-9 w-9 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

              <span>
                Loading MOE records...
              </span>

            </div>

          ) : moes.length === 0 ? (

            /* Empty */
            <div className="p-12 text-center text-gray-500">
              No MOE schools found.
            </div>

          ) : (

            /* Data table */
            <div className="overflow-x-auto">

              <table className="min-w-full text-sm">

                <thead className="bg-gray-100">

                  <tr>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      School Name
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      School Address
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Opening Period
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      School Type ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Allowed School Level ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Class to Be Taught ID
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Created At
                    </th>

                    <th className="whitespace-nowrap px-4 py-3 text-left">
                      Updated At
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y">

                  {moes.map(
                    (school) => (
                      <tr
                        key={
                          school.id
                        }
                        className="transition hover:bg-gray-50"
                      >

                        <td className="px-4 py-3">
                          {school.id}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {school.schoolName ||
                            "-"}
                        </td>

                        <td className="min-w-[350px] px-4 py-3">
                          {school.schoolAddress ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {school.openingPeriod ||
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {school.schoolTypeId ??
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {school.allowedSchoolLevelId ??
                            "-"}
                        </td>

                        <td className="px-4 py-3">
                          {school.classToBeTaughtId ??
                            "-"}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(
                            school.createdAt
                          )}
                        </td>

                        <td className="whitespace-nowrap px-4 py-3">
                          {formatDate(
                            school.updatedAt
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>
          )}

        </section>

      </div>

    </main>
  );
}