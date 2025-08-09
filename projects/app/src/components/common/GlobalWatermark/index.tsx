import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box } from '@chakra-ui/react';
import { useUserStore } from '@/web/support/user/useUserStore';
import { formatTime2YMDHMS } from '@fastgpt/global/common/string/time';
import { useInterval } from 'ahooks';
import { useSystemStore } from '@/web/common/system/useSystemStore';

const GlobalWatermark: React.FC = () => {
  const { feConfigs } = useSystemStore();
  const { userInfo } = useUserStore();
  const [forceUpdate, setForceUpdate] = useState(0);

  const watermarkRef = useRef<HTMLDivElement>(null);
  const backupRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成水印图案
  const watermarkPattern = useMemo(() => {
    // 获取水印文本
    const getWatermarkText = () => {
      if (!userInfo) {
        return feConfigs?.systemTitle || '';
      }

      const username = userInfo.username || '';
      const membername = userInfo.team?.memberName || '';

      return `${username}\n${membername}\n${formatTime2YMDHMS(new Date())}`;
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 300;
    canvas.height = 200;

    const watermarkText = getWatermarkText();
    const lines = watermarkText.split('\n');

    ctx.fillStyle = '#666666';
    ctx.font = '16px Arial, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // 旋转-25度
    ctx.translate(150, 100);
    ctx.rotate((-25 * Math.PI) / 180);

    // 绘制文字
    ctx.globalAlpha = 0.08;

    if (lines.length === 1) {
      // 如果是FastGPT单行文字
      ctx.fillText(lines[0], 0, 0);
    } else {
      // 绘制三行文字
      lines.forEach((line, index) => {
        ctx.fillText(line, 0, (index - 1) * 20);
      });
    }

    return canvas.toDataURL();
  }, [feConfigs?.systemTitle, userInfo, forceUpdate]);

  // 每5秒更新时间
  useInterval(
    () => {
      setForceUpdate((prev) => prev + 1);
    },
    5000,
    {
      immediate: true
    }
  );

  // DOM保护和监控
  useEffect(() => {
    const protectWatermark = () => {
      const watermarkElement = watermarkRef.current;
      const backupElement = backupRef.current;

      if (!watermarkElement || !backupElement) return;

      // 防止样式修改 - 选择性保护
      const preventStyleChanges = (element: HTMLElement) => {
        const originalClass = element.className;

        // 关键样式属性，不允许修改
        const protectedStyles = {
          position: 'fixed',
          top: '0px',
          left: '0px',
          right: '0px',
          bottom: '0px',
          pointerEvents: 'none',
          zIndex: element === watermarkElement ? '999999' : '999998',
          overflow: 'hidden',
          userSelect: 'none',
          display: 'block',
          visibility: 'visible',
          opacity: element === watermarkElement ? '1' : '0.1'
        };

        // 监控style和class属性变化
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes') {
              if (mutation.attributeName === 'class' && element.className !== originalClass) {
                element.className = originalClass;
              }

              if (mutation.attributeName === 'style') {
                // 检查并恢复被篡改的关键样式
                Object.entries(protectedStyles).forEach(([property, value]) => {
                  const computedValue = element.style.getPropertyValue(property);
                  if (computedValue && computedValue !== value) {
                    element.style.setProperty(property, value, 'important');
                  }
                });
              }
            }
          });
        });

        observer.observe(element, {
          attributes: true,
          attributeFilter: ['style', 'class']
        });

        return observer;
      };

      // 防止删除
      const preventRemoval = (element: HTMLElement) => {
        const parent = element.parentNode;
        if (!parent) return;

        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
              mutation.removedNodes.forEach((node) => {
                if (node === element && parent) {
                  // 重新添加水印
                  parent.appendChild(element);
                }
              });
            }
          });
        });

        observer.observe(parent, {
          childList: true
        });

        return observer;
      };

      // 应用保护
      const styleObserver1 = preventStyleChanges(watermarkElement);
      const styleObserver2 = preventStyleChanges(backupElement);
      const removalObserver1 = preventRemoval(watermarkElement);
      const removalObserver2 = preventRemoval(backupElement);

      // 定期检查水印是否存在
      const checkInterval = setInterval(() => {
        if (!document.contains(watermarkElement) && watermarkElement.parentNode) {
          watermarkElement.parentNode.appendChild(watermarkElement);
        }
        if (!document.contains(backupElement) && backupElement.parentNode) {
          backupElement.parentNode.appendChild(backupElement);
        }
      }, 1000);

      return () => {
        styleObserver1?.disconnect();
        styleObserver2?.disconnect();
        removalObserver1?.disconnect();
        removalObserver2?.disconnect();
        clearInterval(checkInterval);
      };
    };

    const cleanup = protectWatermark();
    return cleanup;
  }, []);

  // 监控开发者工具
  useEffect(() => {
    let devtools = {
      open: false,
      orientation: null
    };

    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if (widthThreshold || heightThreshold) {
        if (!devtools.open) {
          devtools.open = true;
          // 可以在这里添加警告或其他安全措施
          console.clear();
        }
      } else {
        devtools.open = false;
      }
    };

    const interval = setInterval(checkDevTools, 500);
    return () => clearInterval(interval);
  }, []);

  const watermarkStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none' as const,
    zIndex: 999999,
    overflow: 'hidden' as const,
    userSelect: 'none' as const,
    backgroundImage: `url(${watermarkPattern}#${forceUpdate})`,
    backgroundRepeat: 'repeat',
    backgroundSize: '300px 200px'
  };

  const backupStyle = {
    ...watermarkStyle,
    zIndex: 999998,
    opacity: 0.1
  };

  return (
    <>
      {/* 主水印 */}
      <Box ref={watermarkRef} style={watermarkStyle} data-watermark="fastgpt-security" />

      {/* 备份水印 */}
      <Box ref={backupRef} style={backupStyle} data-watermark-backup="fastgpt-security-backup" />

      {/* Canvas备份（隐藏） */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          pointerEvents: 'none'
        }}
      />

      {/* CSS样式保护 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          [data-watermark="fastgpt-security"],
          [data-watermark-backup="fastgpt-security-backup"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            pointer-events: none !important;
            user-select: none !important;
            overflow: hidden !important;
            display: block !important;
            visibility: visible !important;
          }
          
          [data-watermark="fastgpt-security"] {
            z-index: 999999 !important;
          }
          
          [data-watermark-backup="fastgpt-security-backup"] {
            z-index: 999998 !important;
          }
        `
        }}
      />
    </>
  );
};

export default GlobalWatermark;
