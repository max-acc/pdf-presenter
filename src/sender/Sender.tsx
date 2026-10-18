import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Document} from "react-pdf";
import {Pane, SplitPane} from "react-split-pane";
import './Sender.css'
import MarkdownRenderer from "./Markdown";
import Timer, {useStopwatch} from "./Timer";
import {KEY, useKeyboardShortcut} from "./KeyboardShortcut";
import FittedPage, {type LaserPosition} from "../common/FittedPage";
import ToastNotification from "../common/ToastNotification";
import Icon from "../ui/Icon";
import {ThemeToggle} from "../ui/Theme";

const channel = new BroadcastChannel("pdf-presenter")

/**
 * Sends the PDF itself (File is structured-cloneable) instead of a blob URL,
 * so the viewer does not depend on the sender's blob URL being resolvable.
 */
function sendPDF(file: File, page: number) {
    channel.postMessage({
        type: "LOAD_PDF",
        file,
        page,
    });
}

function sendPage(page: number) {
    channel.postMessage({type: "SET_PAGE", page})
}

type Blank = "black" | "white" | null;

function sendBlank(color: Blank) {
    channel.postMessage({type: "BLANK", color});
}

function sendLaser(position: LaserPosition | null) {
    channel.postMessage({type: "LASER", position});
}

function isPDF(file: File) {
    return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

function isMarkdown(file: File) {
    return /\.(md|markdown)$/i.test(file.name);
}

function Sender() {
    const [file, setFile] = useState<File | null>(null);
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [markdown, setMarkdown] = useState<string[] | null>(null)
    const [markdownName, setMarkdownName] = useState<string | null>(null);
    const stopwatch = useStopwatch();
    const [snackbar, setSnackbar] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);
    const pdfInput = useRef<HTMLInputElement>(null);
    const markdownInput = useRef<HTMLInputElement>(null);
    const [laserActive, setLaserActive] = useState(false);
    const [laser, setLaser] = useState<LaserPosition | null>(null);
    const laserFrame = useRef<number | null>(null);
    const [blank, setBlank] = useState<Blank>(null);

    const closeSnackbar = useCallback(() => setSnackbar(null), []);

    function handleWindowOpen() {
        if (!file) return;

        const viewer = window.open(`${window.location.origin}${window.location.pathname}#/receiver`, "_blank", "width=1200,height=800");
        if (!viewer) {
            setSnackbar("The viewer window was blocked. Please allow pop-ups for this site.");
            return;
        }
        // Start the timer with the first presentation, but keep it as is once it was used
        if (stopwatch.accumulated === 0) {
            stopwatch.start();
        }
    }

    // A (re)opened viewer announces itself; reply with the PDF and the current slide
    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data.type === "READY" && file) {
                sendPDF(file, page);
                sendBlank(blank);
            }
        };
        channel.addEventListener("message", handler);
        return () => channel.removeEventListener("message", handler);
    }, [file, page, blank]);

    // Sends at most one laser position per frame, so moving the mouse does not flood the channel
    const handleLaserMove = useCallback((position: LaserPosition | null) => {
        setLaser(position);
        if (laserFrame.current !== null) cancelAnimationFrame(laserFrame.current);
        laserFrame.current = requestAnimationFrame(() => {
            laserFrame.current = null;
            sendLaser(position);
        });
    }, []);

    function toggleLaser() {
        if (laserActive) {
            handleLaserMove(null);
        }
        setLaserActive(!laserActive);
    }

    function toggleBlank(color: Exclude<Blank, null>) {
        const next = blank === color ? null : color;
        setBlank(next);
        sendBlank(next);
    }

    function loadPDF(newFile: File) {
        setFile(newFile);
        setPage(1);
        setNumPages(1);
        // Update an already open viewer as well
        sendPDF(newFile, 1);
    }

    function loadMarkdown(newFile: File) {
        const fileReader = new FileReader();
        fileReader.readAsText(newFile);
        fileReader.onload = () => {
            const result = fileReader.result;
            if (typeof result !== "string") return;
            const cleaned = result.replace(/^\s*[\r\n]/gm, "");
            const array = cleaned.split(/\r?\n/);
            setMarkdown(array)
            setMarkdownName(newFile.name);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            loadPDF(e.target.files[0]);
        }
        // Allows selecting the same file again
        e.target.value = "";
    }

    function handleMarkdownChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            loadMarkdown(e.target.files[0]);
        }
        e.target.value = "";
    }

    function handleDragOver(e: React.DragEvent) {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
    }

    function handleDragLeave(e: React.DragEvent) {
        // Ignore leaving into a child element
        if (e.currentTarget.contains(e.relatedTarget as Node | null)) return;
        setDragging(false);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setDragging(false);

        for (const dropped of Array.from(e.dataTransfer.files)) {
            if (isPDF(dropped)) {
                loadPDF(dropped);
            } else if (isMarkdown(dropped)) {
                loadMarkdown(dropped);
            } else {
                setSnackbar(`"${dropped.name}" is not supported. Drop a PDF or a Markdown file.`);
            }
        }
    }

    function clearBlank() {
        if (blank) {
            setBlank(null);
            sendBlank(null);
        }
    }

    function prevPage() {
        clearBlank();
        const pageN = Math.max(page - 1, 1);
        setPage(pageN);
        sendPage(pageN);
    }

    function nextPage() {
        clearBlank();
        const pageN = Math.min(page + 1, numPages);
        setPage(pageN);
        sendPage(pageN);
    }

    useKeyboardShortcut({
        key: KEY.P,
        onKeyDown: () => prevPage()
    })
    useKeyboardShortcut({
        key: KEY.ARROW_LEFT,
        onKeyDown: () => prevPage()
    })
    useKeyboardShortcut({
        key: KEY.SPACE,
        onKeyDown: () => nextPage()
    })
    useKeyboardShortcut({
        key: KEY.N,
        onKeyDown: () => nextPage()
    })
    useKeyboardShortcut({
        key: KEY.ARROW_RIGHT,
        onKeyDown: () => nextPage()
    })
    useKeyboardShortcut({
        key: KEY.L,
        onKeyDown: () => toggleLaser()
    })
    useKeyboardShortcut({
        key: KEY.B,
        onKeyDown: () => toggleBlank("black")
    })
    useKeyboardShortcut({
        key: KEY.W,
        onKeyDown: () => toggleBlank("white")
    })

    return (
        <div
            className={`sender${dragging ? " dragging" : ""}`}
            onDragOver={ handleDragOver }
            onDragLeave={ handleDragLeave }
            onDrop={ handleDrop }>
            <header className={"top-app-bar"}>
                <div className={"brand"}>
                    <Icon name={"slideshow"} />
                    <h1>PDF Presenter</h1>
                </div>
                <div className={"chips"}>
                    {file && (
                        <span className={"chip"} title={file.name}>
                            <Icon name={"pdf"} />
                            <span className={"chip-label"}>{file.name}</span>
                        </span>
                    )}
                    {markdownName && (
                        <span className={"chip"} title={markdownName}>
                            <Icon name={"notes"} />
                            <span className={"chip-label"}>{markdownName}</span>
                        </span>
                    )}
                </div>
                <div className={"actions"}>
                    <button className={"button tonal"} onClick={() => pdfInput.current?.click()}>
                        <Icon name={"upload"} />
                        Upload PDF
                    </button>
                    <button className={"button tonal"} onClick={() => markdownInput.current?.click()}>
                        <Icon name={"notes"} />
                        Upload notes
                    </button>
                    <button className={"button filled"} onClick={ handleWindowOpen } disabled={!file}>
                        <Icon name={"play"} />
                        Present
                    </button>
                    <ThemeToggle />
                </div>
                <input
                    ref={pdfInput}
                    type={"file"}
                    accept={".pdf,application/pdf"}
                    onChange={ handleFileChange }
                    hidden />
                <input
                    ref={markdownInput}
                    type={"file"}
                    accept={".md,.markdown,text/markdown,text/plain"}
                    onChange={ handleMarkdownChange }
                    hidden />
            </header>

            <SplitPane className={"split-pane-custom"} direction={"horizontal"}>
                <Pane className={"split-pane-pane-custom left"} minSize={"480px"} defaultSize={"62%"}>
                    <section className={"card current-slide"}>
                        <h2 className={"card-label"}>Current slide</h2>
                        {file ? (
                            <div className={"slide-surface"}>
                                <Document
                                    file={file}
                                    loading={null}
                                    onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                                    onLoadError={() => setSnackbar(`"${file.name}" could not be opened.`)}>
                                    <FittedPage
                                        pageNumber={page}
                                        laser={laserActive ? laser : null}
                                        onLaserMove={laserActive ? handleLaserMove : undefined} />
                                </Document>
                                {blank && (
                                    <div className={`blank-indicator ${blank}`}>
                                        Screen {blank === "black" ? "blacked" : "whited"} out
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button className={"drop-zone"} onClick={() => pdfInput.current?.click()}>
                                <Icon name={"upload"} />
                                <span className={"drop-zone-title"}>Drop your PDF here</span>
                                <span className={"drop-zone-text"}>or click to choose a file</span>
                            </button>
                        )}
                        <div
                            className={"progress"}
                            role={"progressbar"}
                            aria-label={"Presentation progress"}
                            aria-valuemin={0}
                            aria-valuemax={numPages}
                            aria-valuenow={file ? page : 0}>
                            <div className={"progress-indicator"} style={{width: `${file ? page / numPages * 100 : 0}%`}} />
                        </div>
                    </section>
                    <div className={"bottom-row"}>
                        <section className={"card next-slide"}>
                            <h2 className={"card-label"}>Next slide</h2>
                            <div className={"slide-surface"}>
                                {file && page < numPages && (
                                    <Document file={file} loading={null}>
                                        <FittedPage pageNumber={page + 1} />
                                    </Document>
                                )}
                                {file && page >= numPages && <p className={"placeholder"}>End of presentation</p>}
                                {!file && <p className={"placeholder"}>No PDF loaded</p>}
                            </div>
                        </section>
                        <section className={"card controls"}>
                            <h2 className={"card-label"}>Controls</h2>
                            <div className={"controls-content"}>
                                <div className={"navigation"}>
                                    <button
                                        className={"icon-button tonal large"}
                                        onClick={ prevPage }
                                        disabled={!file || page <= 1}
                                        aria-label={"Previous slide"}
                                        title={"Previous slide (P, ←)"}>
                                        <Icon name={"chevronLeft"} />
                                    </button>
                                    <span className={"page-counter"}>
                                        {file ? page : "–"}
                                        <span className={"page-total"}> / {file ? numPages : "–"}</span>
                                    </span>
                                    <button
                                        className={"icon-button tonal large"}
                                        onClick={ nextPage }
                                        disabled={!file || page >= numPages}
                                        aria-label={"Next slide"}
                                        title={"Next slide (N, →, Space)"}>
                                        <Icon name={"chevronRight"} />
                                    </button>
                                </div>
                                <div className={"tools"}>
                                    <button
                                        className={`icon-button tonal${laserActive ? " active" : ""}`}
                                        onClick={ toggleLaser }
                                        disabled={!file}
                                        aria-pressed={laserActive}
                                        aria-label={"Laser pointer"}
                                        title={"Laser pointer (L)"}>
                                        <Icon name={"laser"} />
                                    </button>
                                    <button
                                        className={`icon-button tonal${blank === "black" ? " active" : ""}`}
                                        onClick={() => toggleBlank("black")}
                                        aria-pressed={blank === "black"}
                                        aria-label={"Black screen"}
                                        title={"Black screen (B)"}>
                                        <Icon name={"blackScreen"} />
                                    </button>
                                    <button
                                        className={`icon-button tonal${blank === "white" ? " active" : ""}`}
                                        onClick={() => toggleBlank("white")}
                                        aria-pressed={blank === "white"}
                                        aria-label={"White screen"}
                                        title={"White screen (W)"}>
                                        <Icon name={"whiteScreen"} />
                                    </button>
                                </div>
                                <Timer stopwatch={stopwatch} />
                            </div>
                        </section>
                    </div>
                </Pane>
                <Pane className={"split-pane-pane-custom right"} minSize={"320px"} defaultSize={"38%"}>
                    <section className={"card notes"}>
                        <h2 className={"card-label"}>Notes</h2>
                        {markdown ? (
                            <MarkdownRenderer markdown={markdown} pageNumber={page} />
                        ) : (
                            <div className={"placeholder notes-empty"}>
                                <p>Upload a Markdown file with your speaker notes.<br />
                                    Each <code># heading</code> starts the notes of the next slide.</p>
                                <button className={"button text"} onClick={() => markdownInput.current?.click()}>
                                    <Icon name={"notes"} />
                                    Upload notes
                                </button>
                            </div>
                        )}
                    </section>
                </Pane>
            </SplitPane>

            <ToastNotification message={snackbar} onClose={closeSnackbar} />
        </div>
    );
}

export default Sender
