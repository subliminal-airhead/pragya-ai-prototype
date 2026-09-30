import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export interface TextLinkProps {
  to: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
  iconRight?: React.ReactNode;
}

export const TextLink: React.FC<TextLinkProps> = ({
  to,
  children,
  external = false,
  className,
  iconRight,
}) => {
  const classes = cn(
    'inline-flex items-center gap-1 text-sm font-semibold text-[#2D6A4F] hover:text-[#24553F] hover:underline transition-colors',
    className
  );

  if (external) {
    return (
      <a href={to} target="_blank" rel="noreferrer" className={classes}>
        {children}
        {iconRight}
      </a>
    );
  }

  return (
    <Link to={to} className={classes}>
      {children}
      {iconRight}
    </Link>
  );
};
