import { useState, useRef, useEffect } from "react";
import NotificationsList from "./NotificationsList";
import { useNotifications } from "../features/notifications/hooks/useNotifications";

export default function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const [modalTop, setModalTop] = useState(null);
  const { data } = useNotifications();
  const notifications = data?.notifications ?? [];
  const hasUnread = notifications.some((n) => !n.isRead);

  useEffect(() => {
    function handlePointer(e) {
      if (!open) return;
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }

    function onKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('pointerdown', handlePointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', handlePointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  useEffect(() => {
    // compute navbar bottom offset so mobile modal can sit just below it
    function computeTop() {
      if (!open) return;
      if (window.innerWidth >= 768) {
        setModalTop(null);
        return;
      }
      const nav = document.querySelector('nav');
      const top = nav ? nav.getBoundingClientRect().bottom : 0;
      setModalTop(Math.ceil(top));
    }
    computeTop();
    window.addEventListener('resize', computeTop);
    return () => window.removeEventListener('resize', computeTop);
  }, [open]);

  useEffect(() => {
    // prevent background (feed) from scrolling when modal is open
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="p-2 rounded-full hover:bg-gray-100 focus:outline-none cursor-pointer"
        type="button"
      >
        {/* Bell icon */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {hasUnread && (
        <span className="absolute top-1 right-2.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white" />
      )}

      {open && (
        <>
          {/* Overlay (mobile only) to close modal when clicking outside */}
          <div
            className="fixed inset-0 z-40 md:hidden pointer-events-auto"
            onPointerDown={() => setOpen(false)}
            onTouchStart={() => setOpen(false)}
          />

          {/* Mobile: centered modal. Desktop: anchored dropdown. */}
          <div
            className={"fixed inset-0 z-50 flex justify-center md:static md:block pointer-events-none " + (modalTop ? 'items-start' : 'items-center')}
            style={modalTop ? { paddingTop: modalTop } : undefined}
          >
            <div
              className="w-full max-w-xs mx-4 md:mx-0 md:w-80 bg-white shadow-lg rounded-md overflow-auto md:overflow-visible md:max-h-64 md:absolute md:right-0 md:mt-2 pointer-events-auto"
              style={{ maxHeight: 'calc(100vh - 5rem)' }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <NotificationsList />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
