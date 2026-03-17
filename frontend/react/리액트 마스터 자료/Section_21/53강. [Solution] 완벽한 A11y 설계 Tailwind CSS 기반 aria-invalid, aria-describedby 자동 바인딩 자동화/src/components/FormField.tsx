import React, { useId } from "react";
import { useFormContext } from "react-hook-form";

interface FormFieldProps {
  label: string;
  name: string;
  children: (id: string, errorId: string) => React.ReactNode;
}

export default function FormField({ label, name, children }: FormFieldProps) {
  const { formState: { errors } } = useFormContext();
  const baseId = useId();
  const errorId = `${baseId}-error`;
  const error = errors[name];

  return (
    <div className="flex flex-col gap-2 group">
      <label 
        htmlFor={baseId} 
        className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1 transition-colors group-focus-within:text-indigo-500"
      >
        {label}
      </label>
      
      {/* Render Props를 통해 ID를 자식에게 안전하게 배달합니다 */}
      {children(baseId, errorId)}
      
      {error && (
        <p 
          id={errorId} 
          role="alert" 
          className="text-xs font-bold text-rose-500 mt-1.5 ml-1 animate-in fade-in slide-in-from-top-1"
        >
          {error.message as string}
        </p>
      )}
    </div>
  );
}