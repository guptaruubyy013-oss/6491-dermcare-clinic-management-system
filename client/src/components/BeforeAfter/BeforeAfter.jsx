{/* --- REPLACEMENT: BROWSE PHOTOS FROM COMPUTER --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          {/* Before Photo Input */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              Before Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setBeforePhoto)}
              className="block w-full text-xs text-gray-500
                         file:mr-3 file:py-1.5 file:px-3
                         file:rounded-md file:border-0
                         file:text-xs file:font-semibold
                         file:bg-emerald-600 file:text-white
                         hover:file:bg-emerald-700
                         border border-gray-300 rounded-md bg-white p-1 cursor-pointer"
            />
            {beforePhoto && (
              <div className="mt-2 relative inline-block">
                <img
                  src={beforePhoto}
                  alt="Before Consultation"
                  className="h-20 w-20 object-cover rounded-md border border-gray-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setBeforePhoto("")}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center shadow hover:bg-red-600"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* After Photo Input */}
          <div className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
              After Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, setAfterPhoto)}
              className="block w-full text-xs text-gray-500
                         file:mr-3 file:py-1.5 file:px-3
                         file:rounded-md file:border-0
                         file:text-xs file:font-semibold
                         file:bg-emerald-600 file:text-white
                         hover:file:bg-emerald-700
                         border border-gray-300 rounded-md bg-white p-1 cursor-pointer"
            />
            {afterPhoto && (
              <div className="mt-2 relative inline-block">
                <img
                  src={afterPhoto}
                  alt="After Consultation"
                  className="h-20 w-20 object-cover rounded-md border border-gray-300 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setAfterPhoto("")}
                  className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center shadow hover:bg-red-600"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Save Button (unchanged) */}
        <button
          type="button"
          onClick={handleSaveCase}
          className="w-full py-3 bg-[#13795b] hover:bg-[#0f644b] text-white font-medium rounded-md shadow transition flex items-center justify-center gap-2"
        >
          Save Case & Push to Billing Queue ✓
        </button>