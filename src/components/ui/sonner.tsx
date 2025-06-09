'use client';

import { useTheme } from 'next-themes';
import { Toaster as Sonner, ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--success-bg': theme === 'dark' ? '#1d4d29' : '#d4edda',
          '--success-text': theme === 'dark' ? '#e6ffed' : '#155724',
          '--success-border': theme === 'dark' ? '#2c6b38' : '#c3e6cb',
          '--error-bg': theme === 'dark' ? '#6e1c24' : '#f8d7da',
          '--error-text': theme === 'dark' ? '#ffdadb' : '#721c24',
          '--error-border': theme === 'dark' ? '#a42a35' : '#f5c6cb'
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
