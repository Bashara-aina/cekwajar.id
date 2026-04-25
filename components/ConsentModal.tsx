"use client";

import { useState } from "react";

interface ConsentModalProps {
  onAccept: () => void;
}

export function ConsentModal({ onAccept }: ConsentModalProps) {
  const [show, setShow] = useState(true);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md mx-4 overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Persetujuan Pemrosesan Data
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Sesuai dengan{" "}
            <a href="#" className="text-blue-600 underline">
              UU PDP No. 27/2022
            </a>
            , kami memerlukan persetujuan Anda untuk memproses data pribadi
            yang diperlukan untuk perhitungan pajak.
          </p>

          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent_required"
                required
                className="mt-1 rounded"
              />
              <label htmlFor="consent_required">
                Saya menyetujui pemrosesan data pribadi saya untuk keperluan
                perhitungan PPh21 dan BPJS (*wajib)
              </label>
            </div>
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="consent_analytics"
                className="mt-1 rounded"
              />
              <label htmlFor="consent_analytics">
                Saya menyetujui penggunaan data anonymized untuk improving
                layanan cekwajar.id
              </label>
            </div>
          </div>

          <button
            onClick={() => {
              setShow(false);
              onAccept();
            }}
            className="w-full bg-blue-600 text-white rounded-lg py-3 font-semibold hover:bg-blue-700"
          >
            Setuju & Lanjutkan
          </button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Dengan melanjutkan, Anda menyetujui{" "}
            <a href="#" className="underline">
              Kebijakan Privasi
            </a>{" "}
            dan{" "}
            <a href="#" className="underline">
              Syarat & Ketentuan
            </a>{" "}
            kami.
          </p>
        </div>
      </div>
    </div>
  );
}
