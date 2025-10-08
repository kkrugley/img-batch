import React, { useState, useEffect } from 'react';
// FIX: Import types from the types.ts module.
import { Preset, OutputSetting } from '../types';
// FIX: Import `Images` icon component to replace `ion-icon`.
import { Plus, Trash2, Images } from './Icons';

const DEFAULT_PRESETS: Preset[] = [
  { 
    id: 'default-1', 
    name: 'Hi-Res + Web (4500px / 2300px)', 
    isDefault: true, 
    outputs: [
      { id: 'default-out-1', folderName: 'Hi-res', longestSide: 4500 },
      { id: 'default-out-2', folderName: 'Web', longestSide: 2300 },
    ] 
  },
];

const getInitialNewPreset = (): { name: string; outputs: OutputSetting[] } => ({
  name: '',
  outputs: [{ id: `new-${Date.now()}`, folderName: 'Hi-res', longestSide: 4500 }],
});

interface PresetManagerProps {
  selectedPresetId: string;
  onPresetChange: (id: string) => void;
  onProcess: (presets: Preset[]) => void;
  outputFormat: 'original' | 'jpeg' | 'png' | 'webp';
  onOutputFormatChange: (format: 'original' | 'jpeg' | 'png' | 'webp') => void;
  jpegQuality: number;
  onJpegQualityChange: (quality: number) => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ 
  selectedPresetId, 
  onPresetChange, 
  onProcess,
  outputFormat,
  onOutputFormatChange,
  jpegQuality,
  onJpegQualityChange,
}) => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPreset, setNewPreset] = useState(getInitialNewPreset());

  useEffect(() => {
    try {
      const storedPresets = localStorage.getItem('image-processor-presets');
      const customPresets = storedPresets ? JSON.parse(storedPresets) : [];
      setPresets([...DEFAULT_PRESETS, ...customPresets]);
    } catch (error) {
        console.error("Failed to load presets from localStorage:", error);
        setPresets([...DEFAULT_PRESETS]);
    }
  }, []);

  const saveCustomPresets = (customPresets: Preset[]) => {
    localStorage.setItem('image-processor-presets', JSON.stringify(customPresets));
  };

  const handleNewPresetChange = (index: number, field: keyof OutputSetting, value: string | number) => {
    const updatedOutputs = [...newPreset.outputs];
    // Ensure 'longestSide' is handled as a number
    const finalValue = field === 'longestSide' ? parseInt(value as string, 10) || 0 : value;
    updatedOutputs[index] = { ...updatedOutputs[index], [field]: finalValue };
    setNewPreset({ ...newPreset, outputs: updatedOutputs });
  };
  
  const addOutput = () => {
    setNewPreset(prev => ({
      ...prev,
      outputs: [...prev.outputs, { id: `new-${Date.now()}`, folderName: '', longestSide: 1920 }]
    }));
  };

  const removeOutput = (id: string) => {
    if (newPreset.outputs.length <= 1) return; // Don't allow removing the last one
    setNewPreset(prev => ({
        ...prev,
        outputs: prev.outputs.filter(o => o.id !== id)
    }));
  }

  const handleAddPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPreset.name && newPreset.outputs.every(o => o.folderName && o.longestSide > 0)) {
      const newPresetItem: Preset = { ...newPreset, id: `custom-${Date.now()}` };
      const updatedPresets = [...presets, newPresetItem];
      setPresets(updatedPresets);
      saveCustomPresets(updatedPresets.filter(p => !p.isDefault));
      setNewPreset(getInitialNewPreset());
      setShowForm(false);
      onPresetChange(newPresetItem.id);
    } else {
        alert("Please fill in all fields for the preset and its outputs.");
    }
  };

  const handleDeletePreset = (id: string) => {
    const updatedPresets = presets.filter(p => p.id !== id);
    setPresets(updatedPresets);
    saveCustomPresets(updatedPresets.filter(p => !p.isDefault));
    if (selectedPresetId === id) {
      onPresetChange(DEFAULT_PRESETS[0].id);
    }
  };

  const selectedPreset = presets.find(p => p.id === selectedPresetId);
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 space-y-6">
      <div>
        <label htmlFor="preset-select" className="block text-sm font-medium text-gray-400 mb-2">Select a Preset</label>
        <div className="flex items-center gap-2">
            <select
              id="preset-select"
              value={selectedPresetId}
              onChange={(e) => onPresetChange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-purple-500 focus:border-purple-500"
            >
              {presets.map(preset => (
                <option key={preset.id} value={preset.id}>{preset.name}</option>
              ))}
            </select>
            {selectedPreset && !selectedPreset.isDefault && (
                <button 
                    onClick={() => handleDeletePreset(selectedPreset.id)}
                    className="flex-shrink-0 p-3 bg-gray-700 text-red-400 rounded-md hover:bg-red-500/20 hover:text-red-300 transition-colors"
                    title="Delete this preset"
                    aria-label="Delete selected preset"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            )}
        </div>
      </div>

      <div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {showForm ? 'Cancel' : 'Create Custom Preset'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddPreset} className="space-y-4 p-4 bg-gray-700/50 rounded-lg animate-fade-in">
          <input type="text" placeholder="Preset Name" value={newPreset.name} onChange={(e) => setNewPreset({ ...newPreset, name: e.target.value })} className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white placeholder-gray-400" required />
          <div className="space-y-3">
              {newPreset.outputs.map((output, index) => (
                  <div key={output.id} className="p-3 bg-gray-800/50 rounded-md space-y-2 border border-gray-600">
                      <div className="flex justify-between items-center">
                        <label className="text-sm font-medium text-gray-400">Output Folder #{index + 1}</label>
                        <button type="button" onClick={() => removeOutput(output.id)} disabled={newPreset.outputs.length <= 1} className="text-red-500 hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed">
                            <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input type="text" placeholder="Folder Name" value={output.folderName} onChange={e => handleNewPresetChange(index, 'folderName', e.target.value)} className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white placeholder-gray-400" required />
                      <input type="number" placeholder="Longest Side (px)" value={output.longestSide} onChange={e => handleNewPresetChange(index, 'longestSide', e.target.value)} className="w-full bg-gray-800 border-gray-600 rounded-md p-2 text-white placeholder-gray-400" required />
                  </div>
              ))}
          </div>
          <button type="button" onClick={addOutput} className="w-full text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center justify-center gap-2 p-2 border border-dashed border-gray-600 hover:border-purple-500 rounded-md">
            <Plus className="w-4 h-4"/> Add Output
          </button>
          <button type="submit" className="w-full bg-purple-600 text-white font-semibold p-2 rounded-md hover:bg-purple-500 transition-colors">Save Preset</button>
        </form>
      )}

      <div className="space-y-4 pt-6 border-t border-gray-700">
        <h4 className="font-semibold text-orange-400 mb-2">Processing Settings</h4>
        <div>
          <label htmlFor="format-select" className="block text-sm font-medium text-gray-400 mb-2">Output Format</label>
          <select
            id="format-select"
            value={outputFormat}
            onChange={(e) => onOutputFormatChange(e.target.value as 'original' | 'jpeg' | 'png' | 'webp')}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-3 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="original">Keep Original</option>
            <option value="jpeg">JPEG</option>
            <option value="png">PNG</option>
            <option value="webp">WEBP</option>
          </select>
        </div>
        
        {(outputFormat === 'jpeg' || outputFormat === 'webp') && (
          <div className="animate-fade-in">
            <label htmlFor="quality-slider" className="block text-sm font-medium text-gray-400 mb-2">
              Quality: <span className="font-bold text-orange-300">{jpegQuality}</span>
            </label>
            <input
              id="quality-slider"
              type="range"
              min="1"
              max="100"
              value={jpegQuality}
              onChange={(e) => onJpegQualityChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>
        )}
      </div>

      <button
        onClick={() => onProcess(presets)}
        className="w-full flex items-center justify-center gap-3 mt-4 px-6 py-4 bg-purple-600 text-white font-bold rounded-lg shadow-lg hover:bg-purple-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-500"
      >
        {/* FIX: Replaced ion-icon with a local SVG component to resolve TypeScript errors. Size is controlled via Tailwind classes. */}
        <Images className="w-6 h-6" />
        Process Images
      </button>
    </div>
  );
};

export default PresetManager;