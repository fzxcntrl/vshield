// Generate initials from full name
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Color palette for avatars
const avatarColors = [
  'bg-blue-600',      // Navy blue
  'bg-indigo-600',    // Indigo
  'bg-purple-600',    // Purple
  'bg-teal-600',      // Teal
  'bg-cyan-600',      // Cyan
  'bg-sky-600',       // Sky blue
  'bg-violet-600',    // Violet
  'bg-slate-700',     // Slate
];

// Generate consistent color based on name
export function getAvatarColor(name: string): string {
  const firstChar = name.trim()[0]?.toUpperCase() || 'A';
  const charCode = firstChar.charCodeAt(0);
  const index = charCode % avatarColors.length;
  return avatarColors[index];
}

// Get avatar props
export function getAvatarProps(name: string) {
  return {
    initials: getInitials(name),
    color: getAvatarColor(name),
  };
}
