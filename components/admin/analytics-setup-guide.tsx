"use client";

import { useState } from "react";

interface SetupStep {
  title: string;
  description: string;
  details: string[];
  status?: "pending" | "warning" | "error" | "success";
}

export function AnalyticsSetupGuide() {
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const setupSteps: SetupStep[] = [
    {
      title: "1. Create Google Cloud Project",
      description: "Tạo project trên Google Cloud Console",
      details: [
        "Truy cập https://console.cloud.google.com/",
        "Tạo project mới hoặc chọn project hiện có",
        "Ghi nhớ Project ID để sử dụng trong GA_PROJECT_ID",
      ],
    },
    {
      title: "2. Enable Google Analytics Data API",
      description: "Kích hoạt Analytics Data API trong project",
      details: [
        "Vào Google Cloud Console > APIs & Services > Library",
        "Tìm kiếm 'Google Analytics Data API'",
        "Click 'Enable' để kích hoạt API",
      ],
    },
    {
      title: "3. Create Service Account",
      description: "Tạo service account để authenticate",
      details: [
        "Vào Google Cloud Console > IAM & Admin > Service Accounts",
        "Click 'Create Service Account'",
        "Đặt tên service account (ví dụ: 'analytics-service')",
        "Không cần gán role ở bước này",
      ],
    },
    {
      title: "4. Generate Service Account Key",
      description: "Tạo JSON key cho service account",
      details: [
        "Click vào service account vừa tạo",
        "Vào tab 'Keys' > 'Add Key' > 'Create new key'",
        "Chọn 'JSON' format và download file",
        "Lưu file JSON này an toàn",
      ],
    },
    {
      title: "5. Get Google Analytics Property ID",
      description: "Lấy GA4 Property ID từ Google Analytics",
      status: "warning",
      details: [
        "⚠️ QUAN TRỌNG: Phải là GA4 property, không phải Universal Analytics",
        "Truy cập https://analytics.google.com/",
        "Chọn GA4 property của bạn (có biểu tượng GA4)",
        "Vào Admin > Property Settings",
        "Copy 'Property ID' (dạng số 9-10 chữ số, ví dụ: 123456789)",
        "KHÔNG sử dụng Tracking ID (UA-XXXXXXX-X) của Universal Analytics",
        "Property ID hiện tại: 507529760 - Kiểm tra xem có đúng không?",
      ],
    },
    {
      title: "6. Add Service Account to GA Property",
      description: "Cấp quyền cho service account truy cập GA property",
      status: "error",
      details: [
        "⚠️ BƯỚC QUAN TRỌNG NHẤT - Thường bị bỏ qua",
        "Vào Google Analytics > Admin > Property Access Management",
        "Click '+' để thêm user mới",
        "Nhập email của service account (từ JSON key)",
        "Chọn role 'Viewer' hoặc 'Analyst'",
        "Click 'Add' để hoàn thành",
      ],
    },
    {
      title: "7. Configure Environment Variables",
      description: "Cập nhật .env.local với thông tin từ JSON key",
      details: [
        "GA_PROPERTY_ID=your-property-id (từ bước 5)",
        "GA_PROJECT_ID=project-id (từ JSON key)",
        "GA_CLIENT_EMAIL=service-account-email (từ JSON key)",
        "GA_SERVICE_ACCOUNT_EMAIL=service-account-email (từ JSON key)",
        "GA_PRIVATE_KEY=private-key (từ JSON key, giữ nguyên format)",
      ],
    },
  ];

  const commonErrors = [
    {
      error: "PERMISSION_DENIED",
      solution:
        "Service account chưa được thêm vào GA property. Thực hiện bước 6 ở trên.",
      color: "text-red-400",
    },
    {
      error: "INVALID_ARGUMENT",
      solution:
        "Property ID không đúng. Kiểm tra lại GA_PROPERTY_ID trong .env.local",
      color: "text-yellow-400",
    },
    {
      error: "AUTHENTICATION_FAILED",
      solution:
        "Thông tin service account không đúng. Kiểm tra lại JSON key và env variables",
      color: "text-orange-400",
    },
    {
      error: "MISSING_CONFIG",
      solution:
        "Thiếu environment variables. Đảm bảo tất cả GA_* variables đã được set",
      color: "text-blue-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-yellow-500/20">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h3 className="text-yellow-500 font-semibold mb-2">
              Google Analytics Setup Required
            </h3>
            <p className="text-yellow-200 text-sm mb-3">
              Google Analytics Dashboard cần được cấu hình trước khi sử dụng.
              Vui lòng làm theo các bước dưới đây để setup.
            </p>
            <div className="text-yellow-200 text-sm">
              <p className="font-medium">Lỗi hiện tại: PERMISSION_DENIED</p>
              <p>Service account chưa có quyền truy cập GA property.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Setup Steps */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <h3 className="text-xl font-semibold text-white mb-6">
          Setup Instructions
        </h3>

        <div className="space-y-4">
          {setupSteps.map((step, index) => (
            <div
              key={index}
              className="border border-[#2E2E2E] rounded-lg overflow-hidden"
            >
              <button
                onClick={() =>
                  setActiveStep(activeStep === index ? null : index)
                }
                className={`w-full p-4 text-left flex items-center justify-between hover:bg-[#2E2E2E] transition-colors ${
                  step.status === "error"
                    ? "bg-red-900/20 border-red-500/30"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.status === "error"
                        ? "bg-red-500 text-white"
                        : step.status === "warning"
                        ? "bg-yellow-500 text-black"
                        : step.status === "success"
                        ? "bg-green-500 text-white"
                        : "bg-[#DA291C] text-white"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-white">{step.title}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    activeStep === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {activeStep === index && (
                <div className="p-4 bg-[#2E2E2E] border-t border-[#3E3E3E]">
                  <ul className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-start gap-2 text-sm text-gray-300"
                      >
                        <span className="text-[#DA291C] mt-1">•</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Common Errors */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <h3 className="text-xl font-semibold text-white mb-4">
          Common Errors & Solutions
        </h3>

        <div className="space-y-3">
          {commonErrors.map((item, index) => (
            <div key={index} className="p-4 bg-[#2E2E2E] rounded-lg">
              <div className="flex items-start gap-3">
                <code
                  className={`px-2 py-1 rounded text-xs font-mono ${item.color} bg-black/30`}
                >
                  {item.error}
                </code>
                <p className="text-sm text-gray-300 flex-1">{item.solution}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Connection */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <h3 className="text-xl font-semibold text-white mb-4">
          Test Connection
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Sau khi hoàn thành setup, bạn có thể test kết nối tại:
        </p>
        <a
          href="/api/analytics/test"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
          Test GA Connection
        </a>

        <a
          href="/api/analytics/debug"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Debug API Calls
        </a>
      </div>

      {/* Helpful Links */}
      <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
        <h3 className="text-xl font-semibold text-white mb-4">Helpful Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="https://console.cloud.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 text-[#DA291C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-white">Google Cloud Console</span>
          </a>

          <a
            href="https://analytics.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 text-[#DA291C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-white">Google Analytics</span>
          </a>

          <a
            href="https://developers.google.com/analytics/devguides/reporting/data/v1/quickstart-client-libraries"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 text-[#DA291C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-white">GA Data API Docs</span>
          </a>

          <a
            href="https://developers.google.com/analytics/devguides/reporting/data/v1/property-id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 p-3 bg-[#2E2E2E] hover:bg-[#3E3E3E] rounded-lg transition-colors text-sm"
          >
            <svg
              className="w-4 h-4 text-[#DA291C]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="text-white">Property ID Guide</span>
          </a>
        </div>
      </div>
    </div>
  );
}
