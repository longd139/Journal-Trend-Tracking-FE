import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ideaAPI } from '../features/idea/api.js';
import { toast } from 'sonner';

let taskIdCounter = 0;

export const useIdeaAnalysisStore = create(
  devtools(
    (set, get) => ({
      // ── State ──
      task: null,
      // Shape when present:
      // {
      //   id: string,
      //   ideaText: string,
      //   keywords: string[],
      //   primaryKeyword: string,
      //   status: 'running' | 'done' | 'error',
      //   startedAt: number,
      //   completedAt: number | null,
      //   error: string | null,
      //   result: null | { analysisId, keywords, papers, gapAnalysis, literatureReview },
      // }

      // ── Actions ──

      /**
       * Start an analysis in the background. Survives page navigation because
       * the promise chain lives in the store closure, not in a React component.
       * Only one analysis runs at a time.
       */
      startAnalysis: ({ ideaText, selectedKeywords }) => {
        const current = get().task;
        if (current?.status === 'running') {
          toast.error('An analysis is already in progress');
          return;
        }

        const id = `idea-${++taskIdCounter}`;
        const primaryKeyword = selectedKeywords[0] || 'research';

        const task = {
          id,
          ideaText,
          keywords: selectedKeywords,
          primaryKeyword,
          status: 'running',
          startedAt: Date.now(),
          completedAt: null,
          error: null,
          result: null,
        };

        set({ task });

        // Fire-and-forget: the promise lives in the store, not in React
        ideaAPI
          .analyze({ ideaText, selectedKeywords })
          .then((result) => {
            set((state) =>
              state.task?.id === id
                ? {
                    task: {
                      ...state.task,
                      status: 'done',
                      completedAt: Date.now(),
                      result,
                    },
                  }
                : {},
            );
          })
          .catch((err) => {
            const message =
              err.response?.data?.message || err.message || 'Analysis failed';
            set((state) =>
              state.task?.id === id
                ? {
                    task: {
                      ...state.task,
                      status: 'error',
                      completedAt: Date.now(),
                      error: message,
                    },
                  }
                : {},
            );
          });
      },

      /**
       * Dismiss the current task. Only works for non-running tasks.
       */
      dismissTask: () => {
        const task = get().task;
        if (!task) return;
        if (task.status === 'running') {
          toast.error('Cannot dismiss a running analysis');
          return;
        }
        set({ task: null });
      },

      /**
       * Consume the result and clear the task. Returns the result so
       * the IdeaPage can display it on mount after navigation.
       */
      clearAndAcknowledge: () => {
        const task = get().task;
        if (!task) return null;
        const result = task.status === 'done' ? task.result : null;
        set({ task: null });
        return result;
      },
    }),
    { name: 'useIdeaAnalysisStore' },
  ),
);
