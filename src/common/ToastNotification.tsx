import {useEffect} from "react";
import Icon from "../ui/Icon";
import "./ToastNotification.css";

interface ToastNotificationArgs {
    message: string | null;
    onClose: () => void;
    duration?: number;
}

/**
 * Material 3 snackbar, showing a short message at the bottom of the screen.
 *
 * @param param0            Default parameter.
 * @param param0.message    The message to show, nothing is rendered if `null`.
 * @param param0.onClose    Called when the snackbar is dismissed or the duration has passed.
 * @param param0.duration   Time in milliseconds after which the snackbar closes itself.
 */
function ToastNotification({message, onClose, duration = 5000}: ToastNotificationArgs) {
    useEffect(() => {
        if (!message) return;
        const timeout = setTimeout(onClose, duration);
        return () => clearTimeout(timeout);
    }, [message, onClose, duration]);

    if (!message) return null;

    return (
        <div className={"snackbar"} role={"status"}>
            <span className={"snackbar-message"}>{message}</span>
            <button className={"icon-button"} aria-label={"Dismiss"} onClick={onClose}>
                <Icon name={"close"} />
            </button>
        </div>
    );
}

export default ToastNotification
