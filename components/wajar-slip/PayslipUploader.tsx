"use client";

import { useState, useCallback } from "react";
import { Upload, Camera, ChevronDown, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface PayslipUploaderProps {
  onFileSelect?: (file: File) => void;
  onManualToggle?: () => void;
  className?: string;
}

export function PayslipUploader({
  onFileSelect,
  onManualToggle,
  className,
}: PayslipUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showTips, setShowTips] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && (file.type.startsWith("image/") || file.type === "application/pdf")) {
        setSelectedFile(file);
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200",
          isDragging
            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
            : "border-border hover:border-emerald-400 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20",
          selectedFile && "border-emerald-400 bg-emerald-50/20 dark:bg-emerald-950/20"
        )}
      >
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label="Unggah slip gaji"
        />

        {selectedFile ? (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 p-3">
                <FileText className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              {selectedFile.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-muted p-4">
                <Upload className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm font-medium mb-1">
              Seret slip gaji ke sini, atau klik untuk pilih
            </p>
            <p className="text-xs text-muted-foreground">
              Format: JPG, PNG, PDF (maks. 5MB)
            </p>
          </>
        )}
      </div>

      {/* OCR status notice */}
      <p className="text-xs text-center text-muted-foreground">
        <Camera className="inline w-3 h-3 mr-1" />
        OCR akan otomatis mengekstrak data dari slip — gratis, anonim, tidak disimpan
      </p>

      {/* Manual input toggle */}
      <div className="text-center">
        <button
          type="button"
          onClick={onManualToggle}
          className="text-xs text-muted-foreground hover:text-primary underline transition-colors"
        >
          Atau isi manual →
        </button>
      </div>

      {/* Photo Tips */}
      <details
        className="mt-2 group"
        open={showTips}
        onToggle={(e) => setShowTips((e.target as HTMLDetailsElement).open)}
      >
        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground flex items-center gap-1 transition-colors list-none">
          <span>📷 Tips foto slip gaji yang baik</span>
          <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center gap-1 text-green-700 dark:text-green-400 font-semibold mb-2">
              <CheckCircle2 className="w-3 h-3" /> Foto yang bagus
            </div>
            <ul className="space-y-1 text-green-700 dark:text-green-400">
              <li>✓ Pencahayaan cukup, tidak gelap</li>
              <li>✓ Teks terbaca jelas</li>
              <li>✓ Tidak ada bayangan di atas teks</li>
              <li>✓ Seluruh slip masuk frame</li>
              <li>✓ Tidak buram / blur</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-1 text-red-700 dark:text-red-400 font-semibold mb-2">
              <AlertCircle className="w-3 h-3" /> Hindari
            </div>
            <ul className="space-y-1 text-red-700 dark:text-red-400">
              <li>✗ Foto miring atau terpotong</li>
              <li>✗ Flash langsung ke kertas</li>
              <li>✗ Resolusi terlalu rendah</li>
              <li>✗ File PDF yang di-screenshot</li>
              <li>✗ Bayangan jari/tangan</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          💡 Kalau hasilnya tidak akurat, coba isi manual di bawah.
        </p>
      </details>
    </div>
  );
}
