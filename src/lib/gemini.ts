import type { AiAnalysisResult } from '../types/index.ts';

const blobToInlinePart = async (
  blob: Blob
): Promise<{ inline_data: { mime_type: string; data: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inline_data: {
          mime_type: 'image/png',
          data: base64Data,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export async function analyzeDocumentBoundaries(
  pages: Blob[],
  apiKey: string,
  model: string,
  namingRule: string
): Promise<AiAnalysisResult> {
  const imageParts = await Promise.all(pages.map(blobToInlinePart));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const namingInstruction = namingRule
    ? `命名ルール: ${namingRule}`
    : '各書類には、内容に基づいた適切な日本語ファイル名をつけてください。日付がわかる場合は「YYYYMMDD_書類名」の形式にしてください。';

  const prompt = `あなたはプロフェッショナルな書類整理AIです。
以下の${pages.length}ページのPDF画像を分析してください。
これは複数の異なる書類が1つのPDFにまとめられたものです。

各ページの内容を確認し、どこで書類が切り替わるかを判定してください。

${namingInstruction}

出力は以下のJSON形式のみで返してください。マークダウンは使用しないでください。
{
  "segments": [
    {
      "name": "20250401_訴状",
      "startPage": 1,
      "endPage": 3,
      "description": "訴状のタイトルがページ上部に表示"
    }
  ]
}

ルール:
1. startPageとendPageは1始まりです
2. 全てのページがいずれかのセグメントに含まれること
3. セグメントは連続するページで構成されること
4. 書類の切り替わりは、ヘッダー、タイトル、書類形式の変化で判定すること
5. nameはファイル名として使える文字のみ使用すること（/\\:*?"<>|は不可）
6. descriptionは簡潔に（50文字以内）`;

  const payload = {
    contents: [
      {
        parts: [{ text: prompt }, ...imageParts],
      },
    ],
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `Gemini API Error: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const cleanText = text
    .replace(/```json?\n?/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleanText);
}
