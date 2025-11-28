import React, { useState, useRef, useEffect } from 'react';
import { generateImage, editImage, analyzeImage, generateSpeech } from '../services/geminiService';
import { AspectRatio, ImageSize } from '../types';
import { Wand2, ImagePlus, Mic, ScanEye, PlayCircle, Loader2 } from 'lucide-react';

interface AIToolsProps {
  onImageGenerated: (url: string) => void;
  onImageAnalyzed: (text: string) => void;
}

export const AITools: React.FC<AIToolsProps> = ({ onImageGenerated, onImageAnalyzed }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'edit' | 'analyze' | 'tts'>('generate');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generation State
  const [genPrompt, setGenPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [imageSize, setImageSize] = useState<ImageSize>(ImageSize.SIZE_1K);

  // Edit State
  const [editPrompt, setEditPrompt] = useState('');
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);

  // Analyze State
  const [analyzeFile, setAnalyzeFile] = useState<File | null>(null);
  const [analyzePreview, setAnalyzePreview] = useState<string | null>(null);
  const [analyzePrompt, setAnalyzePrompt] = useState('Describe this property for a real estate report.');

  // TTS State
  const [ttsText, setTtsText] = useState('');

  const handleGenerate = async () => {
    if (!genPrompt) return;
    setLoading(true);
    setError(null);
    try {
      const url = await generateImage(genPrompt, aspectRatio, imageSize);
      onImageGenerated(url);
    } catch (e: any) {
      setError(e.message || "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editPrompt || !editImagePreview) return;
    setLoading(true);
    setError(null);
    try {
      const url = await editImage(editImagePreview, editPrompt);
      onImageGenerated(url);
    } catch (e: any) {
      setError(e.message || "Failed to edit image");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!analyzePreview) return;
    setLoading(true);
    setError(null);
    try {
      const text = await analyzeImage(analyzePreview, analyzePrompt);
      onImageAnalyzed(text);
    } catch (e: any) {
      setError(e.message || "Failed to analyze image");
    } finally {
      setLoading(false);
    }
  };

  const handleTTS = async () => {
      if(!ttsText) return;
      setLoading(true);
      setError(null);
      try {
          const buffer = await generateSpeech(ttsText);
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const source = ctx.createBufferSource();
          source.buffer = buffer;
          source.connect(ctx.destination);
          source.start(0);
      } catch (e: any) {
          setError(e.message || "Failed to generate speech");
      } finally {
          setLoading(false);
      }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: any, setPreview: any) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md border border-gray-100 h-fit sticky top-6">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
        <Wand2 className="w-5 h-5 text-purple-600" /> AI Assistant
      </h3>

      <div className="flex gap-2 mb-6 border-b pb-2 overflow-x-auto">
        <button
            onClick={() => setActiveTab('generate')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === 'generate' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Generate
        </button>
        <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === 'edit' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Edit
        </button>
        <button
            onClick={() => setActiveTab('analyze')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === 'analyze' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Analyze
        </button>
        <button
            onClick={() => setActiveTab('tts')}
            className={`px-3 py-1.5 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === 'tts' ? 'bg-purple-100 text-purple-700' : 'text-gray-500 hover:bg-gray-100'}`}
        >
            Speech
        </button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
            {error}
        </div>
      )}

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Prompt</label>
            <textarea
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              rows={3}
              placeholder="A modern living room with large windows..."
              value={genPrompt}
              onChange={(e) => setGenPrompt(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Size</label>
                <select 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as ImageSize)}
                >
                    {Object.values(ImageSize).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Aspect Ratio</label>
                <select 
                    className="w-full p-2 border rounded-lg text-sm"
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                >
                    {Object.values(AspectRatio).map(r => <option key={r} value={r}>{r}</option>)}
                </select>
            </div>
          </div>
          <button
            onClick={handleGenerate}
            disabled={loading || !genPrompt}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ImagePlus className="w-4 h-4" />}
            Generate Image
          </button>
        </div>
      )}

      {/* EDIT TAB */}
      {activeTab === 'edit' && (
        <div className="space-y-4">
           <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Image</label>
            <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, setEditImageFile, setEditImagePreview)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          {editImagePreview && (
              <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                  <img src={editImagePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Edit Instruction</label>
            <textarea
              className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
              rows={3}
              placeholder="Add a retro filter, remove the chair..."
              value={editPrompt}
              onChange={(e) => setEditPrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleEdit}
            disabled={loading || !editPrompt || !editImagePreview}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
             {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            Edit Image (Nano Banana)
          </button>
        </div>
      )}

      {/* ANALYZE TAB */}
      {activeTab === 'analyze' && (
        <div className="space-y-4">
             <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Upload Image</label>
            <input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, setAnalyzeFile, setAnalyzePreview)}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
            />
          </div>
          {analyzePreview && (
              <div className="relative h-32 w-full rounded-lg overflow-hidden bg-gray-100">
                  <img src={analyzePreview} alt="Preview" className="w-full h-full object-contain" />
              </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Question/Prompt</label>
            <input
                type="text"
                className="w-full p-2 border rounded-lg text-sm"
                value={analyzePrompt}
                onChange={(e) => setAnalyzePrompt(e.target.value)}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={loading || !analyzePreview}
            className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ScanEye className="w-4 h-4" />}
            Analyze Image
          </button>
        </div>
      )}

      {/* TTS TAB */}
      {activeTab === 'tts' && (
          <div className="space-y-4">
            <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Text to Speak</label>
                <textarea
                    className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                    rows={4}
                    placeholder="Enter text to generate speech..."
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                />
            </div>
            <button
                onClick={handleTTS}
                disabled={loading || !ttsText}
                className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                Generate Audio
            </button>
          </div>
      )}

    </div>
  );
};