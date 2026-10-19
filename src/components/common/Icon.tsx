import React from 'react';
import * as Icons from 'lucide-react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
  className?: string;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '', color, ...props }) => {
  // @ts-expect-error dynamic icon lookup
  const LucideIcon = Icons[name] || Icons.CircleDot;
  return <LucideIcon size={size} className={className} color={color} {...props} />;
};

