import { useState, useEffect, useRef, useCallback } from 'react';
import { graphAPI } from '../lib/api/graph.api';

const POLL_INTERVAL = 2000; // 2 seconds
const TIMEOUT_MS = 90000;   // 1 minute 30 seconds

/**
 * useGraphSearch — async keyword graph search with polling.
 *
 * States: idle → processing → completed | failed | timeout
 *
 * Usage:
 *   const { status, progress, nodes, links, error, elapsed, keyword, search } = useGraphSearch();
 *   search('machine learning', 1);
 */
export function useGraphSearch() {
  const [status, setStatus] = useState('idle'); // idle | processing | completed | failed | timeout
  const [progress, setProgress] = useState('');
  const [nodes, setNodes] = useState([]);
  const [links, setLinks] = useState([]);
  const [error, setError] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [currentKeyword, setCurrentKeyword] = useState('');

  const pollRef = useRef(null);
  const elapsedRef = useRef(null);
  const startTimeRef = useRef(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      clearInterval(pollRef.current);
      clearInterval(elapsedRef.current);
    };
  }, []);

  const search = useCallback(async (keyword, depth = 1) => {
    if (!keyword?.trim()) return;

    clearInterval(pollRef.current);
    clearInterval(elapsedRef.current);
    cancelledRef.current = false;
    setStatus('processing');
    setProgress(`Exploring related topics for: ${keyword.trim()}`);
    setNodes([]);
    setLinks([]);
    setError('');
    setElapsed(0);
    setCurrentKeyword(keyword.trim());
    startTimeRef.current = Date.now();

    let seconds = 0;
    elapsedRef.current = setInterval(() => {
      seconds++;
      setElapsed(seconds);
    }, 1000);

    try {
      const startResult = await graphAPI.startGraphSearch(keyword.trim(), depth);
      const taskId = startResult?.taskId;

      if (!taskId) {
        clearInterval(elapsedRef.current);
        setStatus('failed');
        setError('No task ID returned from server');
        return;
      }

      setProgress(startResult?.message || `Exploring related topics for: ${keyword.trim()}`);

      pollRef.current = setInterval(async () => {
        if (cancelledRef.current) {
          clearInterval(pollRef.current);
          clearInterval(elapsedRef.current);
          return;
        }

        // Timeout check
        if (Date.now() - startTimeRef.current > TIMEOUT_MS) {
          clearInterval(pollRef.current);
          clearInterval(elapsedRef.current);
          setStatus('timeout');
          setError('Search timed out after 1 minute 30 seconds. Please try again with a different keyword.');
          return;
        }

        try {
          const pollResult = await graphAPI.getGraphStatus(taskId);

          if (pollResult?.status === 'COMPLETED') {
            clearInterval(pollRef.current);
            clearInterval(elapsedRef.current);
            const result = pollResult.result || pollResult;
            setNodes(result.nodes || []);
            setLinks(result.links || []);
            setStatus('completed');
            setProgress('Done');
            return;
          }

          if (pollResult?.status === 'FAILED') {
            clearInterval(pollRef.current);
            clearInterval(elapsedRef.current);
            setStatus('failed');
            setError(pollResult.progress || 'Graph search failed');
            return;
          }

          setProgress(pollResult?.progress || `Exploring related topics for: ${keyword.trim()}`);
        } catch {
          setProgress('Retrying...');
        }
      }, POLL_INTERVAL);
    } catch (err) {
      clearInterval(elapsedRef.current);
      setStatus('failed');
      setError(err?.response?.data?.message || err?.message || 'Failed to start graph search');
    }
  }, []);

  return { status, progress, nodes, links, error, elapsed, keyword: currentKeyword, search };
}
