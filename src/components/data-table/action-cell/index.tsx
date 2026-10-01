import { Icon } from '@iconify/react';
import clsx from 'clsx';

import { focusRing, iconButton } from '../styles';
import type { TableAction } from '../types';

export default function ActionCell<T>({ row, actions }: { row: T; actions: TableAction<T>[] }) {
  if (!actions.length) return null;

  return (
    <div className="flex items-center justify-end gap-1">
      {actions.map((a) => (
        <button
          key={a.label}
          type="button"
          aria-label={a.label}
          title={a.label}
          disabled={a.disabled}
          onClick={(e) => {
            // Don't also fire the row's onRowClick.
            e.stopPropagation();
            a.command(row);
          }}
          className={clsx(iconButton, focusRing, a.tone === 'danger' ? 'text-error' : 'text-body')}
        >
          <Icon icon={a.icon} width={16} height={16} aria-hidden />
        </button>
      ))}
    </div>
  );
}
