import { Icon } from '@iconify/react';
import clsx from 'clsx';
import { useId } from 'react';

import { focusRing, secondaryButton } from '../styles';
import type { ExportFormat } from '../types';

const FORMAT_LABEL: Record<ExportFormat, string> = { csv: 'CSV', xlsx: 'Excel', pdf: 'PDF' };

interface Props {
  searchable: boolean;
  search: string;
  onSearch: (value: string) => void;
  placeholder: string;
  formats: ExportFormat[];
  onExport: (format: ExportFormat) => void;
  exporting: ExportFormat | null;
  exportError: string | null;
}

export default function Toolbar({
  searchable,
  search,
  onSearch,
  placeholder,
  formats,
  onExport,
  exporting,
  exportError,
}: Props) {
  const searchId = useId();
  if (!searchable && !formats.length) return null;

  return (
    <div className="flex flex-col gap-2 px-6 pb-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        {searchable && (
          <div className="relative w-full md:max-w-xs">
            <label htmlFor={searchId} className="sr-only">
              Search table
            </label>
            <Icon
              icon="lucide:search"
              width={16}
              height={16}
              aria-hidden
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              id={searchId}
              type="search"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder={placeholder}
              className="h-10 w-full rounded-md border border-hairline bg-canvas pl-9 pr-3 text-body-sm text-ink placeholder:text-muted-soft outline-none focus-visible:border-primary focus-visible:ring-[3px] focus-visible:ring-primary/15"
            />
          </div>
        )}
        {formats.length > 0 && (
          <div role="group" aria-label="Download" className="flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => onExport(f)}
                disabled={exporting !== null}
                aria-busy={exporting === f}
                className={clsx(secondaryButton, focusRing)}
              >
                <Icon
                  icon={exporting === f ? 'lucide:loader-circle' : 'lucide:download'}
                  width={16}
                  height={16}
                  aria-hidden
                  className={clsx(exporting === f && 'motion-safe:animate-spin')}
                />
                {FORMAT_LABEL[f]}
              </button>
            ))}
          </div>
        )}
      </div>
      {exportError && (
        <p role="alert" className="text-caption text-error">
          {exportError}
        </p>
      )}
    </div>
  );
}
