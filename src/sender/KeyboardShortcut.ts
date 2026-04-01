import {useEffect} from "react";

/**
 * Enum class of keytypes corresponding to their key identifiers.
 */
export enum KEY {
    /** Arrow key pointing to the left. */
    ARROW_LEFT = 'ArrowLeft',

    /** Arrow key pointing to the right. */
    ARROW_RIGHT = 'ArrowRight',

    /** Spacebar. */
    SPACE = 'Space',

    /** Key for letter `n`. */
    N = 'KeyN',

    /** Key for letter `p`. */
    P = 'KeyP',
}

interface KeyboardShortcutArgs {
    key: KEY;
    onKeyDown: () => void;
}

/**
 * Function for handling functions on keyboard presses.
 *
 * @param param0            Function wrapper.
 * @param param0.key        The key to be pressed.
 * @param param0.onKeyDown  The function to be executed.
 */
export function useKeyboardShortcut({
    key,
    onKeyDown,
    }: KeyboardShortcutArgs) {
    useEffect(() => {
        function keyDownHandler(e: globalThis.KeyboardEvent) {
            if (e.code === key && !e.repeat) {
                e.preventDefault();
                onKeyDown();
            }
        }

        document.addEventListener("keydown", keyDownHandler);

        return () => {
            document.removeEventListener("keydown", keyDownHandler);
        }
    }, [key, onKeyDown]);
}
