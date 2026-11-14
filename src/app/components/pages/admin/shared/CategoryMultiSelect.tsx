import React, { useState } from "react";
import { X, Plus, Check, Tag } from "lucide-react";
import { G, getBrandCatColor, inp } from "./constants";

export type CategoryOption = { id: number; name: string; emoji: string };

interface CategoryMultiSelectProps {
  categories: CategoryOption[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  loading?: boolean;
  error?: string;
  hint?: string;
  compact?: boolean;
}

export function CategoryMultiSelect({
  categories,
  selectedCategories,
  onChange,
  loading = false,
  error,
  hint,
  compact = false,
}: CategoryMultiSelectProps) {
  const [filterSearch, setFilterSearch] = useState("");

  const unselected = categories.filter(c => !selectedCategories.includes(c.name));

  const toggleCategory = (catName: string) => {
    if (selectedCategories.includes(catName)) {
      onChange(selectedCategories.filter(c => c !== catName));
    } else {
      onChange([...selectedCategories, catName]);
    }
  };

  const removeCategory = (catName: string) => {
    onChange(selectedCategories.filter(c => c !== catName));
  };

  const makePrimary = (catName: string) => {
    if (selectedCategories[0] === catName) return;
    onChange([catName, ...selectedCategories.filter(c => c !== catName)]);
  };

  const filteredCategories = filterSearch.trim()
    ? categories.filter(c =>
        c.name.toLowerCase().includes(filterSearch.trim().toLowerCase())
      )
    : categories;

  return (
    <div className="space-y-2.5">
      {/* Selected category chips */}
      <div className="min-h-[42px] p-2 rounded-xl border border-gray-200 bg-gray-50/70 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
          <span className="flex items-center gap-1.5">
            <Tag size={12} className="text-gray-400" />
            Selected ({selectedCategories.length}):
          </span>
          {selectedCategories.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[10px] text-gray-400 hover:text-red-500 font-bold transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {selectedCategories.length === 0 ? (
          <p className="text-xs text-gray-400 italic py-1">
            {loading ? "Loading categories…" : "No categories selected. Pick one or more below."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selectedCategories.map((catName, index) => {
              const catOpt = categories.find(c => c.name === catName);
              const color = getBrandCatColor(catName);
              const isPrimary = index === 0;

              return (
                <div
                  key={catName}
                  className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-xs font-bold border transition-all"
                  style={{
                    backgroundColor: `${color}14`,
                    borderColor: `${color}35`,
                    color: color,
                  }}
                >
                  <span>{catOpt?.emoji || "🏷️"}</span>
                  <span>{catName}</span>
                  {isPrimary ? (
                    <span
                      className="text-[9px] uppercase px-1.5 py-0.5 rounded font-black tracking-wider shadow-xs"
                      style={{ backgroundColor: color, color: "#ffffff" }}
                      title="Primary Category"
                    >
                      Primary
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makePrimary(catName)}
                      className="text-[9px] px-1 py-0.5 rounded text-gray-500 hover:text-gray-800 hover:bg-black/5 font-semibold transition-colors"
                      title="Click to set as primary category"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCategory(catName)}
                    className="p-0.5 rounded hover:bg-black/10 transition-colors ml-0.5 text-gray-500 hover:text-red-600"
                    title={`Remove ${catName}`}
                    aria-label={`Remove ${catName}`}
                  >
                    <X size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dropdown selector for adding unselected categories */}
      <div className="flex gap-2">
        <select
          value=""
          onChange={e => {
            if (e.target.value) {
              toggleCategory(e.target.value);
            }
          }}
          disabled={loading || unselected.length === 0}
          className={`${inp} text-xs font-semibold`}
        >
          <option value="">
            {loading
              ? "Loading categories…"
              : unselected.length === 0
              ? "All available categories selected"
              : "+ Add category from dropdown…"}
          </option>
          {unselected.map(c => (
            <option key={c.id} value={c.name}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Interactive Quick-Pick Pills */}
      {!compact && categories.length > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-gray-500">
              Quick Select Categories (click to toggle):
            </span>
            {categories.length > 8 && (
              <input
                type="text"
                placeholder="Search categories…"
                value={filterSearch}
                onChange={e => setFilterSearch(e.target.value)}
                className="text-[11px] px-2 py-0.5 rounded-md border border-gray-200 outline-none focus:border-[#009966] bg-white w-32"
              />
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1.5 rounded-xl border border-gray-100 bg-white">
            {filteredCategories.map(cat => {
              const isSelected = selectedCategories.includes(cat.name);
              const color = getBrandCatColor(cat.name);

              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleCategory(cat.name)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    isSelected
                      ? "shadow-xs"
                      : "bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200"
                  }`}
                  style={
                    isSelected
                      ? {
                          backgroundColor: `${color}18`,
                          borderColor: color,
                          color: color,
                          fontWeight: 700,
                        }
                      : {}
                  }
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.name}</span>
                  {isSelected ? (
                    <Check size={12} className="ml-0.5 stroke-[2.5]" />
                  ) : (
                    <Plus size={11} className="ml-0.5 text-gray-400" />
                  )}
                </button>
              );
            })}
            {filteredCategories.length === 0 && (
              <p className="text-xs text-gray-400 py-1 px-2">No matching categories found</p>
            )}
          </div>
        </div>
      )}

      {error && <p role="alert" className="text-xs text-red-600 font-medium">{error}</p>}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

