import { createCanvas, ImageData } from 'canvas';

import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
// @ts-ignore
import('pdfjs-dist/legacy/build/pdf.worker.min.mjs');
import { ReadRawTextByBuffer, ReadFileResponse, ImageType } from '../type';
import { delay } from '@fastgpt/global/common/system/utils';
const OPS = pdfjs.OPS;

type TokenType = {
  str: string;
  dir: string;
  width: number;
  height: number;
  transform: number[];
  fontName: string;
  hasEOL: boolean;
};

// 辅助函数:应用变换矩阵
function applyTransform(point: number[], matrix: number[]) {
  const [x, y] = point;
  const [a, b, c, d, e, f] = matrix;

  return [a * x + c * y + e, b * x + d * y + f];
}

type TextType = {
  type: 'text';
  content: string;
  x: number;
  y: number;
};
type ImageElementType = {
  type: 'image';
  x: number;
  y: number;
  filename: string;
  base64: string;
};
type ElementItemType = TextType | ImageElementType;

export const readPdfFile = async ({ buffer }: ReadRawTextByBuffer): Promise<ReadFileResponse> => {
  const readPDFPage = async (
    doc: any,
    pageNo: number
  ): Promise<{
    rawText: string;
    imageList: ImageType[];
  }> => {
    try {
      const page = await doc.getPage(pageNo);
      const [ops, tokenizedText] = await Promise.all([
        page.getOperatorList(),
        page.getTextContent()
      ]);

      const elements: ElementItemType[] = [];

      // Parse text
      const viewport = page.getViewport({ scale: 1 });
      const pageHeight = viewport.height;
      const headerThreshold = pageHeight * 0.95;
      const footerThreshold = pageHeight * 0.05;

      const pageTexts: TokenType[] = tokenizedText.items.filter((token: TokenType) => {
        return (
          !token.transform ||
          (token.transform[5] < headerThreshold && token.transform[5] > footerThreshold)
        );
      });

      // concat empty string 'hasEOL'
      for (let i = 0; i < pageTexts.length; i++) {
        const item = pageTexts[i];
        if (item.str === '' && pageTexts[i - 1]) {
          pageTexts[i - 1].hasEOL = item.hasEOL;
          pageTexts.splice(i, 1);
          i--;
        }
      }

      pageTexts.forEach((item) => {
        const [tx, ty] = applyTransform([item.transform[4], item.transform[5]], [1, 0, 0, 1, 0, 0]);

        const paragraphEnd = item.hasEOL && /([。？！.?!\n\r]|(\r\n))$/.test(item.str);
        elements.push({
          type: 'text',
          content: paragraphEnd ? `${item.str}\n` : item.str,
          x: tx,
          y: ty
        });
      });

      // Parse image
      let graphicsState: {
        transformMatrix: number[];
        stack: number[][];
      } = {
        transformMatrix: [1, 0, 0, 1, 0, 0],
        stack: []
      };
      for (let j = 0; j < ops.fnArray.length; j++) {
        const op = ops.fnArray[j];
        const args = ops.argsArray[j];

        // Parse special ops
        switch (op) {
          case OPS.save:
            graphicsState.stack.push([...graphicsState.transformMatrix]);
            break;
          case OPS.restore:
            if (graphicsState.stack.length > 0) {
              graphicsState.transformMatrix = graphicsState.stack.pop() || [1, 0, 0, 1, 0, 0];
            }
            break;
          case OPS.transform:
            const [a, b, c, d, e, f] = args;
            const current = graphicsState.transformMatrix;
            graphicsState.transformMatrix = [
              a * current[0] + b * current[2],
              a * current[1] + b * current[3],
              c * current[0] + d * current[2],
              c * current[1] + d * current[3],
              e * current[0] + f * current[2] + current[4],
              e * current[1] + f * current[3] + current[5]
            ];
            break;
          // 处理图片
          case OPS.paintImageXObject:
            const imgName = args[0];
            try {
              const imgObj: {
                data: Uint8Array;
                width: number;
                height: number;
              } = await new Promise((resolve, reject) => {
                page.objs.get(imgName, resolve, reject);
              });

              if (imgObj?.data) {
                const matrix = graphicsState.transformMatrix;
                const [imgX, imgY] = applyTransform([0, 0], matrix);

                // 创建 canvas 并绘制图片
                const canvas = createCanvas(imgObj.width, imgObj.height);
                const ctx = canvas.getContext('2d');

                // 创建 ImageData
                const imageData = new ImageData(
                  new Uint8ClampedArray(imgObj.data),
                  imgObj.width,
                  imgObj.height
                );
                ctx.putImageData(imageData, 0, 0);

                // 转换为 base64
                const base64Image = canvas.toDataURL('image/png');

                elements.push({
                  type: 'image',
                  x: imgX,
                  y: imgY,
                  filename: imgName,
                  base64: base64Image
                });
              }
            } catch (error) {
              console.error(`Error processing image ${imgName}:`, error);
            }
            break;
        }
      }

      // Sort elements
      elements.sort((a, b) => {
        if (b.y !== a.y) return b.y - a.y; // Y大的在前面
        return a.x - b.x; // 同 Y 时 X 小的在前
      });

      // Get text content
      let content = '';
      const imageList: ImageType[] = [];

      for (const el of elements) {
        if (el.type === 'text') {
          content += el.content;
        } else {
          content = content.trim();
          content += `\n![](${el.filename})\n`;
          imageList.push({
            uuid: el.filename,
            base64: el.base64,
            mime: 'image/png'
          });
        }
      }

      page.cleanup();
      return {
        rawText: content,
        imageList
      };
    } catch (error) {
      console.log('pdf read error', error);
      return {
        rawText: '',
        imageList: []
      };
    }
  };

  const loadingTask = pdfjs.getDocument(buffer.buffer);
  const doc = await loadingTask.promise;

  // Avoid OOM.
  const numPages = doc.numPages;

  let rawText = '';
  const imageList: ImageType[] = [];
  for (let i = 0; i < numPages; i++) {
    const pageResult = await readPDFPage(doc, i + 1);
    rawText += pageResult.rawText;
    imageList.push(...pageResult.imageList);
  }

  loadingTask.destroy();

  console.log(rawText);

  await delay(1000);

  return {
    rawText,
    imageList
  };
};
