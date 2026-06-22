import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { adminAPI } from '../lib/api/admin.api';
import { toast } from 'sonner';

let taskIdCounter = 0;

const API_MAP = {
  openalex: (p) => adminAPI.syncOpenAlex(p),
  semanticScholar: (p) => adminAPI.syncSemanticScholar(p),
  arxiv: (p) => adminAPI.syncArxiv(p),
  core: (p) => adminAPI.syncCore(p),
};

const POLL_INTERVAL_MS = 2500;

export const useSyncStore = create(
  devtools(
    (set, get) => {
      let bulkPollTimer = null;

      const stopBulkPolling = () => {
        if (bulkPollTimer) {
          clearInterval(bulkPollTimer);
          bulkPollTimer = null;
        }
      };

      return {
        // ── State ──
        tasks: [],
        bulkTask: null, // { id, status, percent, totalKeywords, completedKeywords, currentKeyword, totalFetched, totalInserted, error?, result? }

        // ── Actions ──

        /**
         * Start sync tasks for the given sources.
         */
        startTasks: (sources, params) => {
          const newTasks = sources.map((source) => {
            const id = `sync-${++taskIdCounter}`;
            return { id, source, status: 'running' };
          });

          set((state) => ({ tasks: [...state.tasks, ...newTasks] }));

          newTasks.forEach((task) => {
            const fn = API_MAP[task.source];
            if (!fn) {
              set((state) => ({
                tasks: state.tasks.map((t) =>
                  t.id === task.id
                    ? { ...t, status: 'error', error: `Unknown source: ${task.source}` }
                    : t,
                ),
              }));
              return;
            }

            fn(params)
              .then((result) => {
                set((state) => ({
                  tasks: state.tasks.map((t) =>
                    t.id === task.id ? { ...t, status: 'done', result } : t,
                  ),
                }));
              })
              .catch((err) => {
                set((state) => ({
                  tasks: state.tasks.map((t) =>
                    t.id === task.id
                      ? {
                          ...t,
                          status: 'error',
                          error: err.response?.data?.message || err.message || 'Sync failed',
                        }
                      : t,
                  ),
                }));
              });
          });
        },

        /**
         * Start a bulk sync. Handles POST → poll loop internally.
         * Polling survives tab navigation because it lives in the store.
         *
         * @param {{ keywords?: string[], papersPerKeyword?: number, yearFrom?: number, yearTo?: number }} body
         */
        startBulkSync: async (body) => {
          // Stop any existing bulk poll
          stopBulkPolling();

          // Initial state
          set({
            bulkTask: {
              id: null,
              status: 'running',
              percent: 0,
              totalKeywords: 0,
              completedKeywords: 0,
              currentKeyword: null,
              totalFetched: 0,
              totalInserted: 0,
            },
          });

          try {
            // Helper: API responses are often wrapped as { status, message, data: {...} }
            const unwrap = (res) => (res && res.data ? res.data : res);

            // Step 1: POST to start
            const startResponse = await adminAPI.bulkSync(body);
            const startPayload = unwrap(startResponse);
            const taskId = startPayload.taskId;

            if (!taskId) {
              // Legacy / synchronous response
              set((state) => ({
                bulkTask: {
                  ...state.bulkTask,
                  id: null,
                  status: 'done',
                  percent: 100,
                  totalKeywords: startPayload.totalKeywords ?? 0,
                  completedKeywords: startPayload.totalKeywords ?? 0,
                  totalFetched: startPayload.totalFetched ?? 0,
                  totalInserted: startPayload.totalInserted ?? 0,
                  result: startPayload,
                },
              }));
              toast.success(startResponse.message || startPayload.message || 'Bulk sync completed', {
                position: 'top-right',
                duration: 4000,
              });
              return;
            }

            // Update with real taskId
            set((state) => ({
              bulkTask: { ...state.bulkTask, id: taskId, totalKeywords: startPayload.totalKeywords ?? 0 },
            }));

            toast.success(startResponse.message || startPayload.message || 'Bulk sync started', {
              position: 'top-right',
              duration: 3000,
            });

            // Step 2: Start polling
            const poll = async () => {
              try {
                const progressRaw = await adminAPI.getBulkSyncProgress(taskId);
                const progress = unwrap(progressRaw);

                const status = (progress.status || '').toUpperCase();

                if (status === 'COMPLETED') {
                  stopBulkPolling();
                  set((state) => ({
                    bulkTask: state.bulkTask
                      ? {
                          ...state.bulkTask,
                          status: 'done',
                          percent: 100,
                          totalKeywords: progress.totalKeywords ?? state.bulkTask.totalKeywords,
                          completedKeywords: progress.completedKeywords ?? progress.totalKeywords ?? state.bulkTask.completedKeywords,
                          currentKeyword: progress.currentKeyword ?? state.bulkTask.currentKeyword,
                          totalFetched: progress.totalFetched ?? state.bulkTask.totalFetched,
                          totalInserted: progress.totalInserted ?? state.bulkTask.totalInserted,
                          result: progress.result || progress,
                          keywordStats: progress.keywordStats,
                        }
                      : null,
                  }));
                  const inserted = progress.totalInserted || progress.result?.totalInserted || 0;
                  toast.success(`Bulk sync completed: ${inserted} papers inserted`, {
                    position: 'top-right',
                    duration: 5000,
                  });
                  return;
                }

                if (status === 'FAILED' || status === 'ERROR') {
                  stopBulkPolling();
                  set((state) => ({
                    bulkTask: state.bulkTask
                      ? {
                          ...state.bulkTask,
                          status: 'error',
                          percent: progress.percent ?? state.bulkTask.percent,
                          error: progress.error || 'Bulk sync failed',
                        }
                      : null,
                  }));
                  toast.error(progress.error || 'Bulk sync failed', {
                    position: 'top-right',
                    duration: 5000,
                  });
                  return;
                }

                // RUNNING — update progress
                set((state) => ({
                  bulkTask: state.bulkTask
                    ? {
                        ...state.bulkTask,
                        status: 'running',
                        percent: progress.percent ?? 0,
                        totalKeywords: progress.totalKeywords ?? state.bulkTask.totalKeywords,
                        completedKeywords: progress.completedKeywords ?? state.bulkTask.completedKeywords,
                        currentKeyword: progress.currentKeyword ?? state.bulkTask.currentKeyword,
                        totalFetched: progress.totalFetched ?? state.bulkTask.totalFetched,
                        totalInserted: progress.totalInserted ?? state.bulkTask.totalInserted,
                        keywordStats: progress.keywordStats,
                      }
                    : null,
                }));
              } catch (err) {
                stopBulkPolling();
                const msg = err.response?.data?.message || err.message || 'Failed to fetch progress';
                set((state) => ({
                  bulkTask: state.bulkTask
                    ? { ...state.bulkTask, status: 'error', error: msg }
                    : null,
                }));
                toast.error(msg, { position: 'top-right', duration: 5000 });
              }
            };

            // Fire first poll immediately, then every POLL_INTERVAL_MS
            poll();
            bulkPollTimer = setInterval(poll, POLL_INTERVAL_MS);
          } catch (err) {
            stopBulkPolling();
            const msg = err.response?.data?.message || err.message || 'Bulk sync failed';
            set((state) => ({
              bulkTask: state.bulkTask
                ? { ...state.bulkTask, status: 'error', error: msg }
                : null,
            }));
            toast.error(msg, { position: 'top-right', duration: 5000 });
          }
        },

        dismissBulkTask: () => {
          stopBulkPolling();
          set({ bulkTask: null });
        },

        dismissTask: (id) => {
          set((state) => ({
            tasks: state.tasks.filter((t) => t.id !== id),
          }));
        },

        clearCompleted: () => {
          set((state) => ({
            tasks: state.tasks.filter((t) => t.status === 'running'),
            bulkTask: state.bulkTask?.status === 'done' || state.bulkTask?.status === 'error' ? null : state.bulkTask,
          }));
        },

        clearAll: () => {
          stopBulkPolling();
          set({ tasks: [], bulkTask: null });
        },

        // ── Computed getters ──
        getIsAnyRunning: () => {
          const s = get();
          return s.tasks.some((t) => t.status === 'running') || s.bulkTask?.status === 'running';
        },
        getRunningCount: () => get().tasks.filter((t) => t.status === 'running').length,
        getDoneCount: () => get().tasks.filter((t) => t.status === 'done').length,
        getErrorCount: () => get().tasks.filter((t) => t.status === 'error').length,
        getNonRunningTasks: () => get().tasks.filter((t) => t.status !== 'running'),
      };
    },
    { name: 'SyncStore' },
  ),
);
