"use client"

import { useState, useEffect } from "react"
import { getCategories, normalizeCategoryName, formatCategoryName } from "@/lib/categories"

interface Category {
  id: string
  name: string
  count: number
}

interface CategorySelectorProps {
  value: string
  onChange: (category: string) => void
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode] = useState<"select" | "input">("select")
  const [newCategory, setNewCategory] = useState("")

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
      
      // If no categories, switch to input mode
      if (cats.length === 0) {
        setMode("input")
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    if (val === "__new__") {
      setMode("input")
      setNewCategory("")
      onChange("")
    } else {
      onChange(val)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNewCategory(val)
    onChange(normalizeCategoryName(val))
  }

  const handleBackToSelect = () => {
    setMode("select")
    setNewCategory("")
    onChange("")
  }

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-300">
          Category
        </label>
        <div className="bg-[#2E2E2E] rounded-lg px-4 py-3 text-gray-500">
          Loading categories...
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        Category {value && <span className="text-[#DA291C]">*</span>}
      </label>

      {mode === "select" ? (
        <div className="space-y-2">
          <select
            value={value}
            onChange={handleSelectChange}
            className="w-full bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white focus:border-[#DA291C] focus:outline-none"
          >
            <option value="">-- Chọn category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.count})
              </option>
            ))}
            <option value="__new__">+ Tạo category mới</option>
          </select>
          
          {value && (
            <p className="text-xs text-gray-400">
              Sẽ upload vào: <code className="text-[#DA291C]">{value}/</code>
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategory}
              onChange={handleInputChange}
              placeholder="Nhập tên category (vd: Bruno, Ronaldo, Matches...)"
              className="flex-1 bg-[#2E2E2E] border border-[#3E3E3E] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-[#DA291C] focus:outline-none"
            />
            {categories.length > 0 && (
              <button
                type="button"
                onClick={handleBackToSelect}
                className="px-4 py-3 bg-[#3E3E3E] hover:bg-[#4E4E4E] text-white rounded-lg transition-colors"
                title="Quay lại chọn category có sẵn"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
            )}
          </div>
          
          {newCategory && (
            <div className="space-y-1">
              <p className="text-xs text-gray-400">
                Sẽ tạo category: <span className="text-white font-semibold">{formatCategoryName(newCategory)}</span>
              </p>
              <p className="text-xs text-gray-400">
                Folder trong S3: <code className="text-[#DA291C]">{normalizeCategoryName(newCategory)}/</code>
              </p>
            </div>
          )}
          
          {!newCategory && (
            <p className="text-xs text-gray-500">
              💡 Tip: Dùng tên ngắn gọn, dễ nhớ (vd: bruno, ronaldo, matches)
            </p>
          )}
        </div>
      )}
    </div>
  )
}
