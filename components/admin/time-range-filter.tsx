"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { TimeRange } from "./analytics-dashboard";

interface TimeRangeFilterProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  customDateRange?: { startDate: Date; endDate: Date } | null;
  onCustomDateChange?: (startDate: Date, endDate: Date) => void;
}

export function TimeRangeFilter({
  selectedRange,
  onRangeChange,
  customDateRange,
  onCustomDateChange,
}: TimeRangeFilterProps) {
  const [showCustomPicker, setShowCustomPicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(
    customDateRange?.startDate || null
  );
  const [tempEndDate, setTempEndDate] = useState<Date | null>(
    customDateRange?.endDate || null
  );
  const [dateError, setDateError] = useState<string | null>(null);

  // Preset options
  const presetOptions = [
    { value: "7d" as TimeRange, label: "Last 7 days", icon: "📅" },
    { value: "30d" as TimeRange, label: "Last 30 days", icon: "📊" },
    { value: "90d" as TimeRange, label: "Last 90 days", icon: "📈" },
    { value: "custom" as TimeRange, label: "Custom range", icon: "🗓️" },
  ];

  // Handle preset selection
  const handlePresetSelect = (range: TimeRange) => {
    if (range === "custom") {
      setShowCustomPicker(true);
    } else {
      setShowCustomPicker(false);
      setDateError(null);
    }
    onRangeChange(range);
  };

  // Validate date range
  const validateDateRange = (
    start: Date | null,
    end: Date | null
  ): string | null => {
    if (!start || !end) {
      return "Both start and end dates are required";
    }

    if (start > end) {
      return "Start date must be before end date";
    }

    // End date should not be later than yesterday (GA data has delay)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999); // End of yesterday

    if (end > yesterday) {
      return "End date cannot be later than yesterday (GA data has 1-day delay)";
    }

    // Check if range is too long (max 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (start < oneYearAgo) {
      return "Date range cannot exceed 1 year";
    }

    // Check if range is too short (min 1 day)
    const daysDiff = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysDiff < 1) {
      return "Date range must be at least 1 day";
    }

    return null;
  };

  // Handle custom date apply
  const handleCustomDateApply = () => {
    const error = validateDateRange(tempStartDate, tempEndDate);

    if (error) {
      setDateError(error);
      return;
    }

    if (tempStartDate && tempEndDate && onCustomDateChange) {
      onCustomDateChange(tempStartDate, tempEndDate);
      setShowCustomPicker(false);
      setDateError(null);
    }
  };

  // Handle custom date cancel
  const handleCustomDateCancel = () => {
    setShowCustomPicker(false);
    setDateError(null);
    // Reset to previous values
    setTempStartDate(customDateRange?.startDate || null);
    setTempEndDate(customDateRange?.endDate || null);

    // If no custom range was set, go back to 7d
    if (!customDateRange) {
      onRangeChange("7d");
    }
  };

  // Format date for display
  const formatDateRange = () => {
    if (selectedRange === "custom" && customDateRange) {
      const start = customDateRange.startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const end = customDateRange.endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${start} - ${end}`;
    }

    const option = presetOptions.find((opt) => opt.value === selectedRange);
    return option?.label || "Last 7 days";
  };

  return (
    <div className="bg-[#1C1C1C] p-6 rounded-lg border border-[#2E2E2E]">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Current Selection Display */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Time Period</h3>
          <p className="text-gray-400 text-sm">
            Currently showing:{" "}
            <span className="text-[#DA291C] font-medium">
              {formatDateRange()}
            </span>
          </p>
        </div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2">
          {presetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handlePresetSelect(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedRange === option.value
                  ? "bg-[#DA291C] text-white"
                  : "bg-[#2E2E2E] text-gray-300 hover:bg-[#3E3E3E] hover:text-white"
              }`}
            >
              <span>{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Picker */}
      {showCustomPicker && (
        <div className="mt-6 p-4 bg-[#2E2E2E] rounded-lg border border-[#3E3E3E]">
          <h4 className="text-white font-medium mb-4">
            Select Custom Date Range
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Start Date
              </label>
              <DatePicker
                selected={tempStartDate}
                onChange={(date) => setTempStartDate(date)}
                selectsStart
                startDate={tempStartDate || undefined}
                endDate={tempEndDate || undefined}
                maxDate={(() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return yesterday;
                })()}
                className="w-full bg-[#1C1C1C] border border-[#3E3E3E] rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                placeholderText="Select start date"
                dateFormat="MMM d, yyyy"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                End Date
              </label>
              <DatePicker
                selected={tempEndDate}
                onChange={(date) => setTempEndDate(date)}
                selectsEnd
                startDate={tempStartDate || undefined}
                endDate={tempEndDate || undefined}
                minDate={tempStartDate || undefined}
                maxDate={(() => {
                  const yesterday = new Date();
                  yesterday.setDate(yesterday.getDate() - 1);
                  return yesterday;
                })()}
                className="w-full bg-[#1C1C1C] border border-[#3E3E3E] rounded-lg px-3 py-2 text-white focus:border-[#DA291C] focus:outline-none"
                placeholderText="Select end date"
                dateFormat="MMM d, yyyy"
              />
            </div>
          </div>

          {/* Error Message */}
          {dateError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{dateError}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCustomDateApply}
              disabled={!tempStartDate || !tempEndDate}
              className="px-4 py-2 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Apply Range
            </button>
            <button
              onClick={handleCustomDateCancel}
              className="px-4 py-2 bg-[#3E3E3E] hover:bg-[#4E4E4E] text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>

          {/* Quick Presets for Custom */}
          <div className="mt-4 pt-4 border-t border-[#3E3E3E]">
            <p className="text-sm text-gray-400 mb-2">Quick presets:</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Yesterday", days: 1 },
                { label: "Last week", days: 7 },
                { label: "Last month", days: 30 },
                { label: "Last quarter", days: 90 },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => {
                    const end = new Date();
                    end.setDate(end.getDate() - 1); // End yesterday
                    const start = new Date();
                    start.setDate(end.getDate() - preset.days + 1);
                    setTempStartDate(start);
                    setTempEndDate(end);
                    setDateError(null);
                  }}
                  className="px-3 py-1 bg-[#1C1C1C] hover:bg-[#DA291C] text-gray-300 hover:text-white rounded text-sm transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
