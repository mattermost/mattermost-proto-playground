import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  WalkthroughDocument,
  WalkthroughSceneHandler,
  WalkthroughStep,
} from '@/walkthrough/types';

export type WalkthroughContextValue = {
  document: WalkthroughDocument | null;
  active: boolean;
  stepIndex: number;
  step: WalkthroughStep | null;
  enter: () => void;
  exit: () => void;
  goToStep: (stepIdOrIndex: string | number) => void;
  goNext: () => void;
  goBack: () => void;
  register: (
    doc: WalkthroughDocument,
    options?: { onScene?: WalkthroughSceneHandler },
  ) => void;
  unregister: (prototypeId: string) => void;
};

export const WalkthroughContext = createContext<WalkthroughContextValue | null>(null);

const QUERY_MODE = 'walkthrough';
const QUERY_STEP = 'step';

function readMode(params: URLSearchParams): boolean {
  const v = params.get(QUERY_MODE);
  return v === '1' || v === 'true';
}

export function WalkthroughProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [document, setDocument] = useState<WalkthroughDocument | null>(null);
  const [onScene, setOnScene] = useState<WalkthroughSceneHandler | null>(null);

  const active = Boolean(document) && readMode(searchParams);
  const stepParam = searchParams.get(QUERY_STEP);

  const stepIndex = useMemo(() => {
    if (!document?.steps.length) return 0;
    if (stepParam) {
      const byId = document.steps.findIndex((s) => s.id === stepParam);
      if (byId >= 0) return byId;
    }
    return 0;
  }, [document, stepParam]);

  const step = document?.steps[stepIndex] ?? null;

  const setModeParams = useCallback(
    (nextActive: boolean, nextStepId?: string | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (nextActive) {
            next.set(QUERY_MODE, '1');
            if (nextStepId) next.set(QUERY_STEP, nextStepId);
            else if (!next.get(QUERY_STEP) && document?.steps[0]) {
              next.set(QUERY_STEP, document.steps[0].id);
            }
          } else {
            next.delete(QUERY_MODE);
            next.delete(QUERY_STEP);
          }
          return next;
        },
        { replace: true },
      );
    },
    [document, setSearchParams],
  );

  const enter = useCallback(() => {
    if (!document?.steps.length) return;
    setModeParams(true, document.steps[0].id);
  }, [document, setModeParams]);

  const exit = useCallback(() => {
    setModeParams(false);
  }, [setModeParams]);

  const goToStep = useCallback(
    (stepIdOrIndex: string | number) => {
      if (!document) return;
      const index =
        typeof stepIdOrIndex === 'number'
          ? stepIdOrIndex
          : document.steps.findIndex((s) => s.id === stepIdOrIndex);
      const target = document.steps[index];
      if (!target) return;
      setModeParams(true, target.id);
    },
    [document, setModeParams],
  );

  const goNext = useCallback(() => {
    if (!document) return;
    const next = Math.min(stepIndex + 1, document.steps.length - 1);
    goToStep(next);
  }, [document, goToStep, stepIndex]);

  const goBack = useCallback(() => {
    if (!document) return;
    const prev = Math.max(stepIndex - 1, 0);
    goToStep(prev);
  }, [document, goToStep, stepIndex]);

  const register = useCallback(
    (doc: WalkthroughDocument, options?: { onScene?: WalkthroughSceneHandler }) => {
      setDocument(doc);
      setOnScene(() => options?.onScene ?? null);
    },
    [],
  );

  const unregister = useCallback((prototypeId: string) => {
    setDocument((current) => {
      if (current?.prototypeId !== prototypeId) return current;
      return null;
    });
    setOnScene(null);
  }, []);

  // Drive prototype scene when the active step changes.
  useEffect(() => {
    if (!active || !step || !onScene) return;
    onScene(step.scene, step.sceneState);
  }, [active, step, onScene]);

  // Keep URL step valid when document changes.
  useEffect(() => {
    if (!active || !document?.steps.length) return;
    if (stepParam && document.steps.some((s) => s.id === stepParam)) return;
    setModeParams(true, document.steps[0].id);
  }, [active, document, stepParam, setModeParams]);

  const value = useMemo<WalkthroughContextValue>(
    () => ({
      document,
      active,
      stepIndex,
      step,
      enter,
      exit,
      goToStep,
      goNext,
      goBack,
      register,
      unregister,
    }),
    [
      document,
      active,
      stepIndex,
      step,
      enter,
      exit,
      goToStep,
      goNext,
      goBack,
      register,
      unregister,
    ],
  );

  return (
    <WalkthroughContext.Provider value={value}>{children}</WalkthroughContext.Provider>
  );
}
