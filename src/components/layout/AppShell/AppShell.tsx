import React from 'react';
import './AppShell.css';

interface AppShellProps {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  header,
  sidebar,
  children,
  footer,
}) => {
  return (
    <div className="app-shell">
      {header && <header className="app-shell__header">{header}</header>}
      <div className="app-shell__body">
        {sidebar && <aside className="app-shell__sidebar">{sidebar}</aside>}
        <main className="app-shell__main">{children}</main>
      </div>
      {footer && <footer className="app-shell__footer">{footer}</footer>}
    </div>
  );
};
