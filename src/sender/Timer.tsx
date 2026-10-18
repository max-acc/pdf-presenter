import {useCallback, useEffect, useState} from "react";
import Icon from "../ui/Icon";

interface StopwatchState {
    /** Milliseconds counted before the current run. */
    accumulated: number;
    /** Timestamp the current run started at, or `null` if paused. */
    runningSince: number | null;
}

export interface Stopwatch extends StopwatchState {
    start: () => void;
    pause: () => void;
    reset: () => void;
}

/**
 * State of a stopwatch that can be started, paused and reset.
 */
export function useStopwatch(): Stopwatch {
    const [state, setState] = useState<StopwatchState>({accumulated: 0, runningSince: null});

    const start = useCallback(() => {
        setState((s) => s.runningSince === null ? {...s, runningSince: Date.now()} : s);
    }, []);

    const pause = useCallback(() => {
        setState((s) => s.runningSince === null
            ? s
            : {accumulated: s.accumulated + Date.now() - s.runningSince, runningSince: null});
    }, []);

    // Restarts from zero, keeping it running if it was running
    const reset = useCallback(() => {
        setState((s) => ({accumulated: 0, runningSince: s.runningSince === null ? null : Date.now()}));
    }, []);

    return {...state, start, pause, reset};
}

/**
 * Formats seconds as `m:ss`, or `h:mm:ss` from one hour on.
 */
function formatDuration(totalSeconds: number) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor(totalSeconds / 60) % 60;
    const seconds = String(totalSeconds % 60).padStart(2, "0");

    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
        : `${minutes}:${seconds}`;
}

/**
 * Shows the elapsed presentation time, with buttons to pause/resume and reset it.
 *
 * @param param0            Default parameter.
 * @param param0.stopwatch  The stopwatch to show and control (see `useStopwatch`).
 */
function Timer({stopwatch}: {stopwatch: Stopwatch}) {
    const {accumulated, runningSince, start, pause, reset} = stopwatch;
    const running = runningSince !== null;
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (runningSince === null) return;
        const interval = setInterval(() => setNow(Date.now()), 250);
        return () => clearInterval(interval);
    }, [runningSince]);

    const elapsedMs = accumulated + (running ? Math.max(0, now - runningSince) : 0);
    const toggleLabel = running ? "Pause timer" : elapsedMs > 0 ? "Resume timer" : "Start timer";

    return (
        <div className={`timer${running ? " running" : ""}`}>
            <span className={"timer-value"} aria-label={"Elapsed time"}>{formatDuration(Math.floor(elapsedMs / 1000))}</span>
            <button
                className={"icon-button"}
                onClick={running ? pause : start}
                aria-label={toggleLabel}
                title={toggleLabel}>
                <Icon name={running ? "pause" : "play"} />
            </button>
            <button
                className={"icon-button"}
                onClick={reset}
                disabled={!running && elapsedMs === 0}
                aria-label={"Reset timer"}
                title={"Reset timer"}>
                <Icon name={"replay"} />
            </button>
        </div>
    );
}

export default Timer
