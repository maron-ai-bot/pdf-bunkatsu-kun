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
          mime_type: blob.type || 'image/png',
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
  namingRule: string,
  referenceImages?: Blob[]
): Promise<AiAnalysisResult> {
  const imageParts = await Promise.all(pages.map(blobToInlinePart));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const hasReference = referenceImages && referenceImages.length > 0;

  // プロンプト構築
  let prompt: string;

  if (hasReference) {
    prompt = `あなたはプロフェッショナルな書類整理AIです。

【参照書類について】
添付画像の最初の${referenceImages.length}枚は「参照書類」（月次資料確認書など）です。
この参照書類には番号付きの書類リストが記載されています。
まず参照書類を読み取り、番号と書類名の対応表を把握してください。

【分析対象PDFについて】
続く${pages.length}枚が分析対象のPDFページ画像です。

各ページの内容を確認し、以下を行ってください:
1. どこで書類が切り替わるかを判定
2. 参照書類の番号表と照合し、該当する番号と書類名を特定
3. ファイル名は「番号2桁ゼロ埋め_書類名」形式（例: 01_預金通帳コピー、07_請求書領収書）
4. 参照書類の番号表に該当しないものは「99_その他_内容の説明」形式
5. 同じ番号の書類が複数セグメントに分かれる場合は連番をつける（例: 07_請求書領収書_1、07_請求書領収書_2）

出力は以下のJSON形式のみで返してください。マークダウンは使用しないでください。
{
  "segments": [
    {
      "name": "01_預金通帳コピー",
      "startPage": 1,
      "endPage": 3,
      "description": "第三銀行の通帳コピー"
    }
  ]
}

ルール:
1. startPageとendPageは1始まりで、参照書類を除いた分析対象PDFのページ番号です
2. 全てのページがいずれかのセグメントに含まれること
3. セグメントは連続するページで構成されること
4. 書類の切り替わりは、ヘッダー、タイトル、書類形式の変化で判定すること
5. nameはファイル名として使える文字のみ使用すること（/\\:*?"<>|は不可）
6. descriptionは簡潔に（50文字以内）`;
  } else {
    const namingInstruction = namingRule
      ? `命名ルール: ${namingRule}`
      : '各書類には、内容に基づいた適切な日本語ファイル名をつけてください。日付がわかる場合は「YYYYMMDD_書類名」の形式にしてください。';

    prompt = `あなたはプロフェッショナルな書類整理AIです。
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
  }

  // パーツ構築: 参照書類がある場合は先に配置
  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [];

  if (hasReference) {
    const refParts = await Promise.all(referenceImages.map(blobToInlinePart));
    parts.push({ text: prompt });
    parts.push(...refParts);
    parts.push({ text: '【ここから分析対象PDFのページ画像】' });
    parts.push(...imageParts);
  } else {
    parts.push({ text: prompt });
    parts.push(...imageParts);
  }

  const payload = {
    contents: [
      {
        parts,
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
