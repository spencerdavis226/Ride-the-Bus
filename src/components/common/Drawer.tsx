import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { IconButton } from './IconButton';

type DrawerProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
};

export function Drawer({ open, title, children, onClose }: DrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            key="sheet"
            className="fixed inset-x-0 bottom-0 z-50 overflow-hidden rounded-t-[1.75rem] bg-[#0b1e16] shadow-sheet ring-1 ring-white/[0.09]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            role="dialog"
            aria-modal="true"
          >
            {/* Handle */}
            <div className="flex justify-center pb-1 pt-3">
              <div className="h-[5px] w-10 rounded-full bg-white/[0.20]" />
            </div>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 pt-1">
              <h2 className="text-lg font-bold text-[#fff7e6]">{title}</h2>
              <IconButton label="Close" onClick={onClose} className="h-9 w-9">
                <X size={18} />
              </IconButton>
            </div>
            {/* Content */}
            <div
              className="overflow-y-auto px-5"
              style={{ maxHeight: '62dvh', paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
