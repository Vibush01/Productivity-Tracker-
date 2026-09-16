import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Input: React.FC<InputProps> = ({ label, error, icon, type, className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3.5 text-text-secondary z-[1]">{icon}</span>}
        <input
          type={isPassword && showPassword ? 'text' : type}
          placeholder=" "
          className={`peer w-full py-3.5 px-4 bg-bg-tertiary border rounded-[10px] text-text-primary text-base outline-none transition-all duration-200 placeholder-transparent ${icon ? 'pl-11' : ''} ${error ? 'border-danger focus:shadow-[0_0_0_3px_rgba(255,59,59,0.1)]' : 'border-border focus:border-neon focus:shadow-[0_0_0_3px_rgba(57,255,20,0.1)]'}`}
          {...props}
        />
        <label className={`absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-base pointer-events-none transition-all duration-200 bg-bg-tertiary px-1 peer-focus:top-0 peer-focus:text-xs peer-focus:text-neon peer-not-placeholder-shown:top-0 peer-not-placeholder-shown:text-xs ${icon ? 'left-11 peer-focus:left-3 peer-not-placeholder-shown:left-3' : ''} ${error ? 'text-danger' : ''}`}>
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            className="absolute right-3 text-text-secondary hover:text-text-primary p-1 rounded-md transition-colors"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {error && <span className="block mt-1 text-xs text-danger animate-[shake_0.3s_ease-in-out]">{error}</span>}
    </div>
  );
};

export const TextArea: React.FC<TextAreaProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative">
        <textarea
          placeholder=" "
          className={`peer w-full py-3.5 px-4 bg-bg-tertiary border rounded-[10px] text-text-primary text-base outline-none transition-all duration-200 placeholder-transparent min-h-[100px] resize-y ${error ? 'border-danger' : 'border-border focus:border-neon focus:shadow-[0_0_0_3px_rgba(57,255,20,0.1)]'}`}
          {...props}
        />
        <label className={`absolute left-4 top-3.5 text-text-secondary text-base pointer-events-none transition-all duration-200 bg-bg-tertiary px-1 peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-neon peer-not-placeholder-shown:-top-2.5 peer-not-placeholder-shown:text-xs ${error ? 'text-danger' : ''}`}>
          {label}
        </label>
      </div>
      {error && <span className="block mt-1 text-xs text-danger">{error}</span>}
    </div>
  );
};

export const Select: React.FC<SelectProps> = ({ label, error, options, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`}>
      <div className="relative">
        <select
          className={`w-full py-3.5 px-4 pr-9 bg-bg-tertiary border rounded-[10px] text-text-primary text-base outline-none transition-all duration-200 cursor-pointer appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")] bg-no-repeat bg-[right_14px_center] ${error ? 'border-danger' : 'border-border focus:border-neon'}`}
          {...props}
        >
          <option value="">{label}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-bg-secondary text-text-primary">{opt.label}</option>
          ))}
        </select>
        <label className="absolute left-4 top-0 text-xs text-text-secondary bg-bg-tertiary px-1 pointer-events-none">
          {label}
        </label>
      </div>
      {error && <span className="block mt-1 text-xs text-danger">{error}</span>}
    </div>
  );
};
