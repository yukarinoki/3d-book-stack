// アイコン生成スクリプト
// 実行: npx tsx src/utils/generateIcons.ts

import { writeFileSync } from 'fs';
import { join } from 'path';

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <!-- 背景 -->
  <rect width="512" height="512" fill="#1e293b" rx="64"/>
  
  <!-- 本のスタック -->
  <!-- 一番下の本 -->
  <g transform="translate(256, 256)">
    <rect x="-120" y="40" width="240" height="40" fill="#8B4513" rx="4"/>
    <rect x="-115" y="35" width="230" height="40" fill="#A0522D" rx="4"/>
  </g>
  
  <!-- 真ん中の本 -->
  <g transform="translate(256, 256)">
    <rect x="-110" y="-10" width="220" height="40" fill="#DC143C" rx="4" transform="rotate(-5)"/>
    <rect x="-105" y="-15" width="210" height="40" fill="#FF6347" rx="4" transform="rotate(-5)"/>
  </g>
  
  <!-- 一番上の本 -->
  <g transform="translate(256, 256)">
    <rect x="-100" y="-60" width="200" height="40" fill="#4169E1" rx="4" transform="rotate(8)"/>
    <rect x="-95" y="-65" width="190" height="40" fill="#6495ED" rx="4" transform="rotate(8)"/>
  </g>
  
  <!-- 3Dエフェクト用の影 -->
  <ellipse cx="256" cy="340" rx="140" ry="20" fill="#000000" opacity="0.3"/>
</svg>`;

// SVGファイルを保存
const publicDir = join(process.cwd(), 'public');
writeFileSync(join(publicDir, 'icon.svg'), svgContent);

console.log('アイコンファイルが生成されました:');
console.log('- public/icon.svg');
console.log('\n注意: PNGアイコンを生成するには、以下の手順を実行してください:');
console.log('1. ブラウザで public/generate-icons.html を開く');
console.log('2. 各アイコンをダウンロードして public/ フォルダに保存');
console.log('3. ファイル名: icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png');