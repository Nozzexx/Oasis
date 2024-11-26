// src/components/ui/dropdown-menu.tsx
"use client";

import * as React from "react";

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: Array<{
    label: string;
    onClick: () => void;
  }>;
  className?: string;
}

export interface DropdownMenuTriggerProps {
  children: React.ReactNode;
}

export interface DropdownMenuContentProps {
  children: React.ReactNode;
}

export interface DropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export const DropdownMenu = ({
  trigger,
  items,
  className = "",
}: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative inline-block text-left">
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute right-0 z-20 mt-2 w-56 rounded-md bg-[#2c2c2c] shadow-lg ring-1 ring-black ring-opacity-5 ${className}`}
          >
            <div className="py-1">
              {items.map((item, index) => (
                <button
                  key={index}
                  className="block w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3c3c3c]"
                  onClick={() => {
                    item.onClick();
                    setIsOpen(false);
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const DropdownMenuTrigger = ({ children }: DropdownMenuTriggerProps) => children;
export const DropdownMenuContent = ({ children }: DropdownMenuContentProps) => <div>{children}</div>;
export const DropdownMenuItem = ({ onClick, children }: DropdownMenuItemProps) => (
  <button onClick={onClick}>{children}</button>
);