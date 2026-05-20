import { getAvatarProps } from '../utils/avatarUtils';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export default function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const { initials, color } = getAvatarProps(name);

  return (
    <div
      className={`${color} ${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${className}`}
    >
      {initials}
    </div>
  );
}
