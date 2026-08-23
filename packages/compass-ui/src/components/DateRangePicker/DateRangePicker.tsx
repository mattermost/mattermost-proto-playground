import type { InputHTMLAttributes, KeyboardEvent } from 'react';
import { useState, useCallback, useEffect, useId, useRef } from 'react';
import Button from '@/components/Button/Button';
import IconButton, {
  ICON_BUTTON_ICON_SIZES,
} from '@/components/IconButton/IconButton';
import Icon from '@/components/Icon/Icon';
import CalendarOutlineIcon from '@mattermost/compass-icons/components/calendar-outline';
import ChevronDownIcon from '@mattermost/compass-icons/components/chevron-down';
import ChevronLeftIcon from '@mattermost/compass-icons/components/chevron-left';
import ChevronRightIcon from '@mattermost/compass-icons/components/chevron-right';
import { useOutsideClose } from '@/hooks/useOutsideClose';
import { usePopoverTransition } from '@/hooks/usePopoverTransition';
import styles from './DateRangePicker.module.scss';

export type DateRangePickerMode = 'date' | 'range';

export interface DateRangePickerProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'defaultValue' | 'onChange' | 'type' | 'size'
> {
  /** Optional CSS class name applied to the root element. */
  className?: string;
  /** Selection mode: single date or range. Default: 'date'. */
  mode?: DateRangePickerMode;
  /** Controlled selected date (single mode). ISO string yyyy-mm-dd. */
  value?: string;
  /** Controlled start date (range mode). ISO string. */
  startDate?: string;
  /** Controlled end date (range mode). ISO string. */
  endDate?: string;
  /** Called when a date is selected (single mode). */
  onChange?: (date: string) => void;
  /** Called when range changes (range mode). */
  onRangeChange?: (start: string, end: string) => void;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function formatDateDisplay(iso: string): string {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}

function toIso(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: string, b: string): boolean {
  return a === b;
}

function isBetween(date: string, start: string, end: string): boolean {
  if (!start || !end) return false;
  const [s, e] = start < end ? [start, end] : [end, start];
  return date > s && date < e;
}

/**
 * DateRangePicker — calendar popover for single date or date-range selection.
 * Month/year nav, today shortcut. Matches Figma Date & Range Picker v2.0.0.
 * Used in boards and admin scheduling.
 */
export default function DateRangePicker({
  className = '',
  mode = 'date',
  value,
  startDate,
  endDate,
  onChange,
  onRangeChange,
  disabled,
  id: idProp,
}: DateRangePickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const rootRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const todayIso = toIso(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  // Calendar display state
  const [displayYear, setDisplayYear] = useState(today.getFullYear());
  const [displayMonth, setDisplayMonth] = useState(today.getMonth());
  const [isOpen, setIsOpen] = useState(false);

  // Internal selection state (uncontrolled fallback)
  const [internalDate, setInternalDate] = useState('');
  const [internalStart, setInternalStart] = useState('');
  const [internalEnd, setInternalEnd] = useState('');

  const selectedDate = value ?? internalDate;
  const selectedStart = startDate ?? internalStart;
  const selectedEnd = endDate ?? internalEnd;

  const hasValue =
    mode === 'date' ? Boolean(selectedDate) : Boolean(selectedStart);

  const { mounted: popoverMounted, visible: popoverVisible } =
    usePopoverTransition(isOpen);

  const close = useCallback(() => setIsOpen(false), []);

  useOutsideClose(rootRef, isOpen, close);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const handleToggle = useCallback(() => {
    if (!disabled) setIsOpen((o) => !o);
  }, [disabled]);

  const handlePrevMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 0) {
        setDisplayYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setDisplayMonth((m) => {
      if (m === 11) {
        setDisplayYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }, []);

  const handleToday = useCallback(() => {
    const now = new Date();
    setDisplayYear(now.getFullYear());
    setDisplayMonth(now.getMonth());
  }, []);

  const handleDayClick = useCallback(
    (iso: string) => {
      if (mode === 'date') {
        if (onChange) {
          onChange(iso);
        } else {
          setInternalDate(iso);
        }
        close();
      } else {
        // range mode: first click = start, second = end
        if (!selectedStart || (selectedStart && selectedEnd)) {
          setInternalStart(iso);
          setInternalEnd('');
        } else {
          const [s, e] =
            iso >= selectedStart ? [selectedStart, iso] : [iso, selectedStart];
          if (onRangeChange) {
            onRangeChange(s, e);
          } else {
            setInternalStart(s);
            setInternalEnd(e);
          }
          close();
        }
      }
    },
    [mode, selectedStart, selectedEnd, onChange, onRangeChange, close],
  );

  const handleTriggerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) return;
      switch (e.key) {
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleToggle();
          break;
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            close();
          }
          break;
        case 'Tab':
          if (isOpen) close();
          break;
        default:
          break;
      }
    },
    [disabled, handleToggle, isOpen, close],
  );

  // Build calendar grid
  const daysInMonth = getDaysInMonth(displayYear, displayMonth);
  const firstDay = getFirstDayOfWeek(displayYear, displayMonth);

  // Build weeks (rows of 7 cells; null = empty)
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const displayValue =
    mode === 'date'
      ? formatDateDisplay(selectedDate)
      : selectedStart
        ? `${formatDateDisplay(selectedStart)}${selectedEnd ? ` – ${formatDateDisplay(selectedEnd)}` : ''}`
        : '';

  const rootClass = [
    styles.dateRangePicker,
    isOpen ? styles['dateRangePicker--open'] : '',
    disabled ? styles['dateRangePicker--disabled'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={rootRef} className={rootClass}>
      {/* Trigger input */}
      <div
        className={styles.dateRangePicker__trigger}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-disabled={disabled || undefined}
        tabIndex={disabled ? -1 : 0}
        id={id}
        data-has-value={hasValue ? '' : undefined}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className={styles.dateRangePicker__calendarIcon} aria-hidden>
          <Icon size="16" glyph={<CalendarOutlineIcon />} />
        </span>
        <span className={styles.dateRangePicker__value}>
          {displayValue || 'mm/dd/yyyy'}
        </span>
        <span className={styles.dateRangePicker__chevron} aria-hidden>
          <Icon size="16" glyph={<ChevronDownIcon />} />
        </span>
      </div>

      {/* Calendar popover */}
      {popoverMounted && (
        <div
          className={[
            styles.dateRangePicker__popover,
            popoverVisible ? styles['dateRangePicker__popover--visible'] : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role="dialog"
          aria-modal="false"
          aria-label="Date picker"
        >
          {/* Header */}
          <div className={styles.dateRangePicker__header}>
            <span className={styles.dateRangePicker__monthLabel}>
              {MONTHS[displayMonth]} {displayYear}
            </span>
            <div className={styles.dateRangePicker__headerActions}>
              <Button
                emphasis="Quaternary"
                size="Small"
                leadingIcon={<Icon size="16" glyph={<CalendarOutlineIcon />} />}
                onClick={handleToday}
              >
                Today
              </Button>
              <div className={styles.dateRangePicker__navButtons}>
                <IconButton
                  size="Medium"
                  padding="Compact"
                  icon={
                    <Icon
                      size={ICON_BUTTON_ICON_SIZES['Medium']}
                      glyph={<ChevronLeftIcon />}
                    />
                  }
                  onClick={handlePrevMonth}
                  aria-label="Previous month"
                />
                <IconButton
                  size="Medium"
                  padding="Compact"
                  icon={
                    <Icon
                      size={ICON_BUTTON_ICON_SIZES['Medium']}
                      glyph={<ChevronRightIcon />}
                    />
                  }
                  onClick={handleNextMonth}
                  aria-label="Next month"
                />
              </div>
            </div>
          </div>

          {/* Weekday headers */}
          <div className={styles.dateRangePicker__weekdays}>
            {WEEKDAYS.map((d) => (
              <span key={d} className={styles.dateRangePicker__weekday}>
                {d}
              </span>
            ))}
          </div>

          {/* Date grid */}
          <div className={styles.dateRangePicker__grid}>
            {weeks.map((week, wi) => (
              <div key={wi} className={styles.dateRangePicker__week}>
                {week.map((day, di) => {
                  if (day == null) {
                    return (
                      <span
                        key={di}
                        className={styles.dateRangePicker__dayEmpty}
                      />
                    );
                  }
                  const iso = toIso(displayYear, displayMonth, day);
                  const isToday = iso === todayIso;
                  const isRangeStart =
                    mode === 'range' && isSameDay(iso, selectedStart);
                  const isRangeEnd =
                    mode === 'range' &&
                    Boolean(selectedEnd) &&
                    isSameDay(iso, selectedEnd);
                  const isSelected =
                    mode === 'date'
                      ? isSameDay(iso, selectedDate)
                      : isRangeStart || isRangeEnd;
                  const isInRange =
                    mode === 'range' &&
                    isBetween(iso, selectedStart, selectedEnd);
                  const hasRangeSpan =
                    mode === 'range' &&
                    Boolean(selectedStart) &&
                    Boolean(selectedEnd) &&
                    selectedStart !== selectedEnd;

                  const cellClass = [
                    styles.dateRangePicker__dayCell,
                    isInRange ? styles['dateRangePicker__dayCell--in-range'] : '',
                    hasRangeSpan && isRangeStart
                      ? styles['dateRangePicker__dayCell--range-start']
                      : '',
                    hasRangeSpan && isRangeEnd
                      ? styles['dateRangePicker__dayCell--range-end']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  const dayClass = [
                    styles.dateRangePicker__day,
                    isSelected ? styles['dateRangePicker__day--selected'] : '',
                    isToday && !isSelected
                      ? styles['dateRangePicker__day--today']
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <div key={di} className={cellClass}>
                      <button
                        type="button"
                        className={dayClass}
                        onClick={() => handleDayClick(iso)}
                        aria-label={iso}
                        aria-pressed={isSelected}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
