import React from 'react';
import * as LucideIcons from 'lucide-react';

interface CategoryIconProps {
  name: string;
  className?: string;
  size?: number;
  color?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({
  name,
  className = '',
  size = 18,
  color,
}) => {
  // Try to find the matching icon from Lucide
  const IconComponent = (LucideIcons as Record<string, React.ComponentType<any>>)[name] || LucideIcons.Tag;

  return (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={color ? { color } : undefined}
    >
      <IconComponent size={size} />
    </span>
  );
};
