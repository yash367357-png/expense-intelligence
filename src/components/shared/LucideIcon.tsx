import * as Icons from 'lucide-react';

interface LucideIconProps {
  name: string;
  size?: number;
  className?: string;
  color?: string;
}

export default function LucideIcon({ name, size = 18, className, color }: LucideIconProps) {
  const IconComponent = (Icons as Record<string, React.ComponentType<{ size?: number; className?: string; color?: string }>>)[name];
  if (!IconComponent) {
    // Fallback: render a generic circle icon
    const Fallback = Icons['Circle'];
    return <Fallback size={size} className={className} color={color} />;
  }
  return <IconComponent size={size} className={className} color={color} />;
}
