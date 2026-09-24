import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-neon text-black font-semibold shadow-[0_0_15px_rgba(57,255,20,0.2)] hover:bg-neon-dim hover:shadow-[0_0_30px_rgba(57,255,20,0.5),0_0_60px_rgba(57,255,20,0.2)] hover:-translate-y-0.5 active:translate-y-0',
  secondary: 'bg-transparent text-neon border border-border-neon-strong hover:bg-neon/8 hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:-translate-y-0.5',
  danger: 'bg-danger text-white hover:bg-danger-dim hover:shadow-[0_0_15px_rgba(255,59,59,0.3)] hover:-translate-y-0.5',
  ghost: 'bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-text-primary',
  icon: 'bg-transparent text-text-secondary hover:bg-bg-tertiary hover:text-neon p-2',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-[10px] font-semibold cursor-pointer transition-all duration-200 ease-out whitespace-nowrap select-none ${variantClasses[variant]} ${variant !== 'icon' ? sizeClasses[size] : ''} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-40 cursor-not-allowed !translate-y-0' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-[18px] h-[18px] border-2 border-transparent border-t-current rounded-full animate-spin" />
      ) : (
        <>
          {icon && <span className="flex items-center">{icon}</span>}
          {children && <span className="flex items-center justify-center">{children}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
