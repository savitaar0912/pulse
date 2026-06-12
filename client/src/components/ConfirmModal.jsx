import React from 'react';

export default function ConfirmModal({ open, title, description, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onCancel} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm mx-4 p-6">
        <h3 className="text-lg font-semibold mb-2">{title || 'Confirm'}</h3>
        <p className="text-sm text-gray-600 mb-4">{description || 'Are you sure?'}</p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 text-sm text-white hover:bg-red-600 cursor-pointer"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}
