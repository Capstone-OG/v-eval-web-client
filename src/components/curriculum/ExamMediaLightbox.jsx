import React, { useEffect, useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  Eye
} from 'lucide-react';
import apiClient from '../../services/apiClient';
import { resolveExamMediaUrl, hasChartOrTableInContent } from '../../utils/examParserUtils';

/**
 * Full-screen Lightbox Modal with Zoom controls & ESC dismiss
 */
export function ExamImageLightbox({ image, onClose }) {
  const [zoomState, setZoomState] = useState({ src: null, level: 1 });
  const zoom = zoomState.src === image?.src ? zoomState.level : 1;

  const updateZoom = (updater) => {
    setZoomState((prev) => {
      const cur = prev.src === image?.src ? prev.level : 1;
      const next = typeof updater === 'function' ? updater(cur) : updater;
      return { src: image?.src || null, level: next };
    });
  };

  useEffect(() => {
    if (!image?.src) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === '+' || e.key === '=') {
        setZoomState((prev) => {
          const cur = prev.src === image.src ? prev.level : 1;
          return { src: image.src, level: Math.min(2.5, Number((cur + 0.25).toFixed(2))) };
        });
      }
      if (e.key === '-') {
        setZoomState((prev) => {
          const cur = prev.src === image.src ? prev.level : 1;
          return { src: image.src, level: Math.max(0.5, Number((cur - 0.25).toFixed(2))) };
        });
      }
      if (e.key === '0') setZoomState({ src: image.src, level: 1 });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [image, onClose]);

  if (!image?.src) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="w-full max-w-5xl mb-3 flex items-center justify-between gap-3 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 min-w-0">
          <ImageIcon className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-xs font-semibold text-slate-200 truncate">
            {image.caption || 'Hình ảnh / Đồ thị đề thi'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => updateZoom((z) => Math.max(0.5, Number((z - 0.25).toFixed(2))))}
            title="Thu nhỏ (-)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="px-2 text-xs font-mono font-bold text-cyan-300 min-w-[48px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => updateZoom((z) => Math.min(2.5, Number((z + 0.25).toFixed(2))))}
            title="Phóng to (+)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => updateZoom(1)}
            title="Mặc định (0)"
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          {!image.src.startsWith('data:') && (
            <a
              href={image.src}
              target="_blank"
              rel="noreferrer"
              title="Mở ảnh ở tab mới"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onClose}
            title="Đóng (ESC)"
            className="p-2 rounded-xl bg-rose-500/80 hover:bg-rose-500 text-white transition-colors cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Viewport */}
      <div
        className="max-w-[94vw] max-h-[82vh] overflow-auto rounded-2xl border border-white/15 bg-slate-900/60 p-3 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={image.src}
          alt={image.caption || 'Hình ảnh phóng to'}
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
          className="max-w-full max-h-[76vh] object-contain rounded-lg transition-transform duration-150 bg-white"
        />
      </div>
    </div>
  );
}

/**
 * Smart Figure Box for Passage & Question cards
 */
export function ExamFigureBox({
  imageUrl,
  images = [],
  imageUserAttached = false,
  content = '',
  isPassage = false,
  isLocked = false,
  onZoom,
  onRemoveImage
}) {
  const [forceShowSuppressed, setForceShowSuppressed] = useState(false);
  const baseUrl = apiClient.getBaseUrl();

  const resolvedPrimary = resolveExamMediaUrl(imageUrl, baseUrl);
  const resolvedGallery = (images || [])
    .map((img) => ({
      name: img,
      src: resolveExamMediaUrl(img, baseUrl)
    }))
    .filter((item) => Boolean(item.src));

  const isChartOrTable = hasChartOrTableInContent(content, isPassage);
  const shouldSuppressPrimary = Boolean(resolvedPrimary) && isChartOrTable && !imageUserAttached && !forceShowSuppressed;

  if (!resolvedPrimary && resolvedGallery.length === 0) return null;

  if (shouldSuppressPrimary && resolvedGallery.length === 0) {
    return (
      <div className="my-2">
        <button
          type="button"
          onClick={() => setForceShowSuppressed(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 text-cyan-600" />
          <span>Đã dựng bảng/biểu đồ tương tác • Nhấn để xem ảnh crop PDF gốc</span>
        </button>
      </div>
    );
  }

  return (
    <div className="my-3 space-y-2.5">
      {resolvedPrimary && (!shouldSuppressPrimary) && (
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 max-w-2xl">
          <div className="relative group overflow-hidden rounded-lg bg-white border border-slate-200/70 flex justify-center">
            <img
              src={resolvedPrimary}
              alt={isPassage ? 'Sơ đồ / Hình vẽ minh họa chùm bài' : 'Đồ thị / Hình vẽ minh họa câu hỏi'}
              onClick={() =>
                onZoom?.(
                  resolvedPrimary,
                  isPassage ? 'Sơ đồ / Hình vẽ minh họa chùm bài' : 'Đồ thị / Hình vẽ minh họa câu hỏi'
                )
              }
              className="max-h-[400px] max-w-full object-contain cursor-zoom-in transition-transform duration-200 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
              <span>
                {imageUserAttached
                  ? 'Ảnh đính kèm / dán từ Clipboard (Nhấp vào ảnh để phóng to)'
                  : isPassage
                  ? 'Sơ đồ / Hình vẽ gốc trích xuất từ đề thi (Nhấp để phóng to)'
                  : 'Đồ thị / Hình vẽ gốc trích xuất từ đề thi (Nhấp để phóng to)'}
              </span>
            </span>

            {!isLocked && onRemoveImage && (
              <button
                type="button"
                onClick={onRemoveImage}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span>Gỡ ảnh</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!resolvedPrimary && resolvedGallery.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {resolvedGallery.map((img, idx) => (
            <div
              key={`gal-${idx}`}
              className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 max-w-md"
            >
              <img
                src={img.src}
                alt={`Hình vẽ ${img.name}`}
                onClick={() => onZoom?.(img.src, `Hình vẽ: ${img.name}`)}
                className="max-h-72 max-w-full rounded-lg bg-white object-contain cursor-zoom-in"
                loading="lazy"
              />
              <div className="mt-1.5 text-[11px] text-slate-500 text-center truncate">
                Hình vẽ: {img.name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
