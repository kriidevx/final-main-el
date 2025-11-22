"use client";

interface VoiceControlsProps {
  stability: number;
  similarityBoost: number;
  onStabilityChange: (value: number) => void;
  onSimilarityBoostChange: (value: number) => void;
}

export default function VoiceControls({
  stability,
  similarityBoost,
  onStabilityChange,
  onSimilarityBoostChange,
}: VoiceControlsProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Stability: {stability.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={stability}
          onChange={(e) => onStabilityChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider accent-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controls voice consistency. Higher values make the voice more stable and predictable.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Clarity + Similarity: {similarityBoost.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={similarityBoost}
          onChange={(e) => onSimilarityBoostChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider accent-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Controls voice clarity and character similarity. Higher values enhance voice characteristics.
        </p>
      </div>
    </div>
  );
}