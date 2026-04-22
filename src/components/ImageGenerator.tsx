import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Loader2, Image as ImageIcon, Settings2, Download } from 'lucide-react';

// Declare window.aistudio for TypeScript
declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

export default function ImageGenerator() {
  const [prompt, setPrompt] = useState('A futuristic tech-wear operator standing in a neon-lit cyberpunk city, anime style, high quality, masterpiece');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageSize, setImageSize] = useState('1K');
  const [model, setModel] = useState('gemini-3.1-flash-image-preview');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setGeneratedImage(null);

    try {
      // Check for API key selection if using these models
      if (
        (model === 'gemini-3-pro-image-preview' || model === 'gemini-3.1-flash-image-preview') &&
        window.aistudio
      ) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (!hasKey) {
          await window.aistudio.openSelectKey();
          // Assume success after opening dialog
        }
      }

      // Initialize GenAI with the key (it's injected into process.env.GEMINI_API_KEY or process.env.API_KEY)
      // The instructions say: "The selected API key is available using process.env.API_KEY. It is injected automatically"
      // But for standard models it's process.env.GEMINI_API_KEY. Let's try API_KEY first, fallback to GEMINI_API_KEY.
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API key not found. Please select an API key.");
      }

      const ai = new GoogleGenAI({ apiKey });

      const response = await ai.models.generateContent({
        model: model,
        contents: {
          parts: [
            {
              text: prompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize,
          },
        },
      });

      let foundImage = false;
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          const imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${base64EncodeString}`;
          setGeneratedImage(imageUrl);
          foundImage = true;
          break;
        }
      }

      if (!foundImage) {
        throw new Error("No image was returned by the model.");
      }

    } catch (err: any) {
      console.error("Generation error:", err);
      // Handle race condition error mentioned in docs
      if (err.message?.includes("Requested entity was not found") && window.aistudio) {
        setError("API Key error. Please select your key again.");
        await window.aistudio.openSelectKey();
      } else {
        setError(err.message || "Failed to generate image.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-ak-surface border border-ak-border p-6 tech-border mt-8">
      <div className="flex items-center gap-3 mb-6 border-b border-ak-border pb-4">
        <div className="w-10 h-10 bg-ak-blue/20 flex items-center justify-center clip-angled-tl text-ak-blue">
          <ImageIcon size={20} />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-white tracking-wide">OPERATOR_IMAGING_SYSTEM</h3>
          <p className="font-mono text-xs text-ak-muted">PRTS VISUALIZATION ENGINE v2.0</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div>
            <label className="block font-mono text-xs text-ak-muted mb-2">PROMPT_PARAMETERS</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-ak-bg border border-ak-border p-3 text-sm text-white focus:border-ak-blue focus:outline-none font-sans min-h-[100px] resize-y"
              placeholder="Describe the operator..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-mono text-xs text-ak-muted mb-2">MODEL_SELECT</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-ak-bg border border-ak-border p-2 text-xs text-white focus:border-ak-blue focus:outline-none font-mono"
              >
                <option value="gemini-3.1-flash-image-preview">Flash (Fast)</option>
                <option value="gemini-3-pro-image-preview">Pro (Studio Quality)</option>
              </select>
            </div>
            <div>
              <label className="block font-mono text-xs text-ak-muted mb-2">RESOLUTION</label>
              <select
                value={imageSize}
                onChange={(e) => setImageSize(e.target.value)}
                className="w-full bg-ak-bg border border-ak-border p-2 text-xs text-white focus:border-ak-blue focus:outline-none font-mono"
              >
                <option value="1K">1K (Standard)</option>
                <option value="2K">2K (High)</option>
                <option value="4K">4K (Ultra)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-mono text-xs text-ak-muted mb-2">ASPECT_RATIO</label>
            <div className="grid grid-cols-4 gap-2">
              {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`py-1 text-xs font-mono border transition-colors ${
                    aspectRatio === ratio
                      ? 'bg-ak-blue/20 border-ak-blue text-ak-blue'
                      : 'bg-ak-bg border-ak-border text-ak-muted hover:border-ak-muted'
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="mt-4 w-full bg-ak-blue hover:bg-white text-black font-display font-bold py-3 px-4 clip-angled-br transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Settings2 size={18} />
                <span>GENERATE_IMAGE</span>
              </>
            )}
          </button>

          {error && (
            <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
              ERR: {error}
            </div>
          )}
        </div>

        {/* Output */}
        <div className="lg:col-span-7">
          <div className="w-full h-full min-h-[300px] bg-ak-bg border border-ak-border relative flex items-center justify-center overflow-hidden group">
            <div className="absolute inset-0 bg-stripes opacity-10 pointer-events-none"></div>
            
            {generatedImage ? (
              <>
                <img src={generatedImage} alt="Generated Operator" className="w-full h-full object-contain" />
                <a
                  href={generatedImage}
                  download={`operator-${Date.now()}.png`}
                  className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md border border-ak-border p-2 text-white hover:text-ak-blue transition-colors opacity-0 group-hover:opacity-100"
                  title="Download Image"
                >
                  <Download size={20} />
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center text-ak-muted opacity-50">
                <ImageIcon size={48} className="mb-4" />
                <span className="font-mono text-sm tracking-widest">AWAITING_INPUT</span>
              </div>
            )}
            
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-ak-muted/30"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-ak-muted/30"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-ak-muted/30"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-ak-muted/30"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
