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
import { useAnchoredPopupPortal } from '@/hooks/useAnchoredPopupPortal';
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
  /** Portal mount node for the calendar; defaults to `document.body`. */
  portalContainer?: HTMLElement | null;
  /** Stacking order for the portaled calendar. */
  zIndex?: number;
}

/** Approximate calendar panel height for the initial flip decision. */
const CALENDAR_PREFERRED_HEIGHT = 360;

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

function dayFromIso(iso: string, year: number, month: number): number | null {
  if (!iso) return null;
  const [y, m, d] = iso.split('-').map(Number);
  if (y === year && m === month + 1) return d;
  return null;
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
  portalContainer = null,
  zIndex,
}: DateRangePickerProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const popoverId = `${id}-popover`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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
  /** Roving tabindex day-of-month within the visible grid. */
  const [focusedDay, setFocusedDay] = useState(1);

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

  const {
    placement,
    style: popoverStyle,
    portalRef,
    renderPortal,
  } = useAnchoredPopupPortal(triggerRef, popoverMounted, {
    preferredHeight: CALENDAR_PREFERRED_HEIGHT,
    portalContainer,
    zIndex,
    matchWidth: false,
  });

  const close = useCallback((restoreFocus = true) => {
    setIsOpen(false);
    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }, []);

  useOutsideClose(rootRef, isOpen, () => close(true), portalRef);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  // Close when focus leaves the field and the portaled calendar.
  useEffect(() => {
    if (!isOpen) return;

    function handleFocusIn(e: FocusEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (rootRef.current?.contains(target)) return;
      if (portalRef.current?.contains(target)) return;
      close(false);
    }

    document.addEventListener('focusin', handleFocusIn);
    return () => document.removeEventListener('focusin', handleFocusIn);
  }, [isOpen, close, portalRef]);

  const daysInMonth = getDaysInMonth(displayYear, displayMonth);

  const initialFocusDay = useCallback(() => {
    if (mode === 'date') {
      const fromValue = dayFromIso(selectedDate, displayYear, displayMonth);
      if (fromValue) return fromValue;
    } else {
      const fromEnd = dayFromIso(selectedEnd, displayYear, displayMonth);
      if (fromEnd) return fromEnd;
      const fromStart = dayFromIso(selectedStart, displayYear, displayMonth);
      if (fromStart) return fromStart;
    }
    const fromToday = dayFromIso(todayIso, displayYear, displayMonth);
    if (fromToday) return fromToday;
    return 1;
  }, [
    mode,
    selectedDate,
    selectedStart,
    selectedEnd,
    displayYear,
    displayMonth,
    todayIso,
  ]);

  // On open: after the enter transition enables pointer-events, move focus
  // into the day grid (selected day, today, or the 1st).
  useEffect(() => {
    if (!isOpen || !popoverVisible) return;
    const day = initialFocusDay();
    setFocusedDay(day);
    const frame = requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-day="${day}"]`)
        ?.focus();
    });
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- open/visible transition only
  }, [isOpen, popoverVisible]);

  const focusDayButton = useCallback((day: number) => {
    setFocusedDay(day);
    requestAnimationFrame(() => {
      gridRef.current
        ?.querySelector<HTMLElement>(`[data-day="${day}"]`)
        ?.focus();
    });
  }, []);

  const handleToggle = useCallback(() => {
    if (disabled) return;
    setIsOpen((open) => !open);
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

  const goToAdjacentMonth = useCallback(
    (direction: -1 | 1, preferDay: number) => {
      const nextMonth =
        direction === -1
          ? displayMonth === 0
            ? 11
            : displayMonth - 1
          : displayMonth === 11
            ? 0
            : displayMonth + 1;
      const nextYear =
        direction === -1
          ? displayMonth === 0
            ? displayYear - 1
            : displayYear
          : displayMonth === 11
            ? displayYear + 1
            : displayYear;
      const maxDay = getDaysInMonth(nextYear, nextMonth);
      setDisplayYear(nextYear);
      setDisplayMonth(nextMonth);
      focusDayButton(Math.min(preferDay, maxDay));
    },
    [displayMonth, displayYear, focusDayButton],
  );

  const handleToday = useCallback(() => {
    const now = new Date();
    setDisplayYear(now.getFullYear());
    setDisplayMonth(now.getMonth());
    focusDayButton(now.getDate());
  }, [focusDayButton]);

  const handleDayClick = useCallback(
    (iso: string, day: number) => {
      if (mode === 'date') {
        if (onChange) {
          onChange(iso);
        } else {
          setInternalDate(iso);
        }
        close(true);
      } else {
        // range mode: first click = start, second = end
        if (!selectedStart || (selectedStart && selectedEnd)) {
          setInternalStart(iso);
          setInternalEnd('');
          setFocusedDay(day);
        } else {
          const [s, e] =
            iso >= selectedStart ? [selectedStart, iso] : [iso, selectedStart];
          if (onRangeChange) {
            onRangeChange(s, e);
          } else {
            setInternalStart(s);
            setInternalEnd(e);
          }
          close(true);
        }
      }
    },
    [mode, selectedStart, selectedEnd, onChange, onRangeChange, close],
  );

  const moveFocusedDay = useCallback(
    (delta: number) => {
      const next = focusedDay + delta;
      if (next >= 1 && next <= daysInMonth) {
        focusDayButton(next);
        return;
      }
      if (next < 1) {
        goToAdjacentMonth(-1, getDaysInMonth(
          displayMonth === 0 ? displayYear - 1 : displayYear,
          displayMonth === 0 ? 11 : displayMonth - 1,
        ) + next);
      } else {
        goToAdjacentMonth(1, next - daysInMonth);
      }
    },
    [
      focusedDay,
      daysInMonth,
      displayMonth,
      displayYear,
      focusDayButton,
      goToAdjacentMonth,
    ],
  );

  const handleDayKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>, day: number) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          moveFocusedDay(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          moveFocusedDay(1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveFocusedDay(-7);
          break;
        case 'ArrowDown':
          e.preventDefault();
          moveFocusedDay(7);
          break;
        case 'Home':
          e.preventDefault();
          focusDayButton(1);
          break;
        case 'End':
          e.preventDefault();
          focusDayButton(daysInMonth);
          break;
        case 'PageUp':
          e.preventDefault();
          goToAdjacentMonth(-1, day);
          break;
        case 'PageDown':
          e.preventDefault();
          goToAdjacentMonth(1, day);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          setFocusedDay(day);
          handleDayClick(toIso(displayYear, displayMonth, day), day);
          break;
        default:
          break;
      }
    },
    [
      moveFocusedDay,
      focusDayButton,
      daysInMonth,
      goToAdjacentMonth,
      handleDayClick,
      displayYear,
      displayMonth,
    ],
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
        case 'ArrowDown':
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
          break;
        case 'Escape':
          if (isOpen) {
            e.preventDefault();
            close(true);
          }
          break;
        default:
          break;
      }
    },
    [disabled, handleToggle, isOpen, close],
  );

  // Keep focusedDay in range when the month changes (nav buttons / PageUp).
  useEffect(() => {
    if (!isOpen) return;
    setFocusedDay((d) => Math.min(Math.max(1, d), daysInMonth));
  }, [isOpen, daysInMonth, displayMonth, displayYear]);

  // Build calendar grid
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
        ref={triggerRef}
        className={styles.dateRangePicker__trigger}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={popoverMounted ? popoverId : undefined}
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
      {popoverMounted &&
        renderPortal(
          <div
            ref={portalRef}
            id={popoverId}
            className={[
              styles.dateRangePicker__popover,
              placement === 'above'
                ? styles['dateRangePicker__popover--above']
                : '',
              popoverVisible
                ? styles['dateRangePicker__popover--visible']
                : '',
            ]
              .filter(Boolean)
              .join(' ')}
            style={popoverStyle}
            role="dialog"
            aria-modal="false"
            aria-label="Date picker"
          >
          {/* Header */}
          <div className={styles.dateRangePicker__header}>
            <span className={styles.dateRangePicker__monthLabel} aria-live="polite">
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
          <div className={styles.dateRangePicker__weekdays} aria-hidden>
            {WEEKDAYS.map((d) => (
              <span key={d} className={styles.dateRangePicker__weekday}>
                {d}
              </span>
            ))}
          </div>

          {/* Date grid */}
          <div
            ref={gridRef}
            className={styles.dateRangePicker__grid}
            role="grid"
            aria-label={`${MONTHS[displayMonth]} ${displayYear}`}
          >
            {weeks.map((week, wi) => (
              <div
                key={wi}
                className={styles.dateRangePicker__week}
                role="row"
              >
                {week.map((day, di) => {
                  if (day == null) {
                    return (
                      <span
                        key={di}
                        className={styles.dateRangePicker__dayEmpty}
                        role="gridcell"
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
                    isInRange
                      ? styles['dateRangePicker__dayCell--in-range']
                      : '',
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
                    <div key={di} className={cellClass} role="gridcell">
                      <button
                        type="button"
                        className={dayClass}
                        data-day={day}
                        tabIndex={focusedDay === day ? 0 : -1}
                        onClick={() => handleDayClick(iso, day)}
                        onFocus={() => setFocusedDay(day)}
                        onKeyDown={(e) => handleDayKeyDown(e, day)}
                        aria-label={iso}
                        aria-pressed={isSelected}
                        aria-current={isToday ? 'date' : undefined}
                      >
                        {day}
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>,
        )}
    </div>
  );
}
