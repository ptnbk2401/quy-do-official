"use client";

import { useState, useEffect } from "react";
import {
  RESIZE_OPTIONS,
  resizeImage,
  getImageDimensions,
  formatFileSize,
} from "@/lib/image-utils";

interface ImageResizeProps {
  file: File;
  onConfirm: (resizedFile: File) => void;
  onCancel: () => void;
}

export function ImageResize({ file, onConfirm, onCancel }: ImageResizeProps) {
  const [selectedOption, setSelectedOption] = useState(RESIZE_OPTIONS[1]); // Default to Medium
  const [originalDimensions, setOriginalDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [previewUrl] = useState(() => URL.createObjectURL(file));
  const [resizedFile, setResizedFile] = useState<File | null>(null);
  const [resizedUrl, setResizedUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Get original image dimensions
    getImageDimensions(file).then(setOriginalDimensions);
  }, [file]);

  const calculateNewDimensions = (option: (typeof RESIZE_OPTIONS)[0]) => {
    if (!originalDimensions || option.width === 0) {
      return originalDimensions;
    }

    const { width: originalWidth, height: originalHeight } = originalDimensions;
    const aspectRatio = originalHeight / originalWidth;

    if (originalWidth <= option.width) {
      return { width: originalWidth, height: originalHeight };
    }

    return {
      width: option.width,
      height: Math.round(option.width * aspectRatio),
    };
  };

  const handlePreview = async () => {
    if (selectedOption.width === 0) {
      // Original size
      setResizedFile(file);
      setResizedUrl(previewUrl);
      return;
    }

    setProcessing(true);
    try {
      const resized = await resizeImage(
        file,
        selectedOption.width,
        selectedOption.quality
      );
      setResizedFile(resized);
      setResizedUrl(URL.createObjectURL(resized));
    } catch (error) {
      console.error("Failed to resize image:", error);
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirm = () => {
    if (resizedFile) {
      onConfirm(resizedFile);
    } else {
      onConfirm(file);
    }
  };

  const newDimensions = calculateNewDimensions(selectedOption);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90">
      <div className="bg-[#1C1C1C] rounded-lg max-w-6xl w-full max-h-[95vh] overflow-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#2E2E2E]">
          <h3 className="text-xl font-bold text-white mb-2">Resize Image</h3>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>📁 {file.name}</span>
            <span>📊 {formatFileSize(file.size)}</span>
            <span>🖼️ {file.type}</span>
            {originalDimensions && (
              <span>
                📐 {originalDimensions.width} × {originalDimensions.height}
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resize Options */}
            <div>
              <h4 className="font-semibold text-white mb-4">Resize Options</h4>

              <div className="space-y-3 mb-6">
                {RESIZE_OPTIONS.map((option) => {
                  const dimensions = calculateNewDimensions(option);
                  const isOriginal = option.width === 0;

                  return (
                    <label
                      key={option.name}
                      className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        selectedOption.name === option.name
                          ? "border-[#DA291C] bg-[#DA291C]/10"
                          : "border-[#2E2E2E] bg-[#2E2E2E] hover:border-[#DA291C]/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="resize-option"
                        value={option.name}
                        checked={selectedOption.name === option.name}
                        onChange={() => setSelectedOption(option)}
                        className="sr-only"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-white">
                            {option.name}
                          </span>
                          <span className="text-[#DA291C] text-sm font-medium">
                            Quality: {Math.round(option.quality * 100)}%
                          </span>
                        </div>
                        <div className="text-sm text-gray-400">
                          {isOriginal ? (
                            "Keep original size"
                          ) : (
                            <>
                              Max width: {option.width}px
                              {dimensions && (
                                <span className="ml-2">
                                  → {dimensions.width} × {dimensions.height}px
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handlePreview}
                disabled={processing}
                className="w-full px-4 py-3 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
              >
                {processing ? "Processing..." : "Preview Resize"}
              </button>
            </div>

            {/* Preview */}
            <div>
              <h4 className="font-semibold text-white mb-4">Preview</h4>

              <div className="grid grid-cols-1 gap-4">
                {/* Original */}
                <div>
                  <p className="text-gray-400 text-sm mb-2">Original:</p>
                  <div className="bg-black rounded-lg p-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="max-w-full max-h-[200px] object-contain mx-auto"
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Size: {formatFileSize(file.size)}
                    {originalDimensions && (
                      <span className="ml-2">
                        {originalDimensions.width} × {originalDimensions.height}
                        px
                      </span>
                    )}
                  </div>
                </div>

                {/* Resized */}
                {resizedUrl && resizedFile && (
                  <div>
                    <p className="text-gray-400 text-sm mb-2">
                      Resized ({selectedOption.name}):
                    </p>
                    <div className="bg-black rounded-lg p-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resizedUrl}
                        alt="Resized"
                        className="max-w-full max-h-[200px] object-contain mx-auto"
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Size: {formatFileSize(resizedFile.size)}
                      {newDimensions && (
                        <span className="ml-2">
                          {newDimensions.width} × {newDimensions.height}px
                        </span>
                      )}
                      <span className="ml-2 text-green-400">
                        ({Math.round((1 - resizedFile.size / file.size) * 100)}%
                        smaller)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end mt-6 pt-6 border-t border-[#2E2E2E]">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-[#2E2E2E] hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(file)}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Use Original
            </button>
            <button
              onClick={handleConfirm}
              disabled={!resizedFile}
              className="px-6 py-3 bg-[#DA291C] hover:bg-[#FBE122] hover:text-black text-white rounded-lg transition-colors font-semibold disabled:opacity-50"
            >
              Upload {selectedOption.name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
