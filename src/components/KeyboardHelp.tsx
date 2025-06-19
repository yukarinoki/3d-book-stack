import { useState } from 'react';
import { useBookStore } from '@/stores';

export const KeyboardHelp = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { physicsEnabled } = useBookStore();

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors"
        aria-label="キーボード操作ヘルプ"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
            d="M8 14v3m0 0v3m0-3h8m-8 0h-3m11 0h3m-6-3v-3m0-3v-3m0 3h-3m0 0h-3m6 0h3" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl p-4 w-64">
          <h3 className="font-bold text-lg mb-3">キーボード操作</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">W</span>
              <span className={physicsEnabled ? 'text-gray-400' : ''}>前方へ移動</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">S</span>
              <span className={physicsEnabled ? 'text-gray-400' : ''}>後方へ移動</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">A</span>
              <span className={physicsEnabled ? 'text-gray-400' : ''}>左へ移動</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">D</span>
              <span className={physicsEnabled ? 'text-gray-400' : ''}>右へ移動</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">Space</span>
              <span>物理演算ON/OFF</span>
            </div>
          </div>
          
          {physicsEnabled && (
            <p className="text-xs text-gray-500 mt-3">
              ※ 物理演算がONの時はWASD移動は無効です
            </p>
          )}
          
          <p className="text-xs text-gray-600 mt-3">
            ※ 本を選択してから操作してください
          </p>
        </div>
      )}
    </div>
  );
};