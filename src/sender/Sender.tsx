import React, {useEffect, useState} from 'react';
import {Document, Page} from "react-pdf";
import {Pane, SplitPane} from "react-split-pane";
import './Sender.css'
import MarkdownRenderer from "./Markdown";
import {KEY, useKeyboardShortcut} from "./KeyboardShortcut";

const channel = new BroadcastChannel("pdf-presenter")

function sendPDFUrl(fileUrl: string) {
    channel.postMessage({
        type: "LOAD_PDF",
        url: fileUrl,
    });
}

function sendPage(page: number) {
    channel.postMessage({type: "SET_PAGE", page})
}

function Sender() {
    const [file, setFile] = useState<File | null>(null);
    const [fileUrl, setFileUrl] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [numPages, setNumPages] = useState(1);
    const [markdown, setMarkdown] = useState<string[] | null>(null)

    function handleWindowOpen() {
        if (!file) {
            alert("Please upload a PDF first");
            return;
        }
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        window.open(`${window.location.origin}${window.location.pathname}#/receiver`, "_blank", "width=1200,height=800");
    }

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            if (event.data.type === "READY" && fileUrl) {
                sendPDFUrl(fileUrl);
            }
        };
        channel.addEventListener("message", handler);
        return () => channel.removeEventListener("message", handler);
    }, [fileUrl]);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    }

    function handleMarkdownChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const fileReader = new FileReader();
            fileReader.readAsText(file);
            fileReader.onload = () => {
                const result = fileReader.result;
                if (typeof result !== "string") return;
                const cleaned = result.replace(/^\s*[\r\n]/gm, "");
                const array = cleaned.split(/\r?\n/);
                setMarkdown(array)
            }
        }
    }

    function prevPage() {
        const pageN = Math.max(page - 1, 1);
        setPage(pageN);
        sendPage(pageN);
    }

    function nextPage() {
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

    return (
        <div className="sender">
            <SplitPane className={"split-pane-custom"} direction={"horizontal"}>
                <Pane className={"split-pane-pane-custom left"} minSize={"700px"} defaultSize={"50%"}>
                    <div className={"slide-preview"}>
                        <h1>Current Slide</h1>
                        <div className={"document-renderer"}>
                            <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)}>
                                <Page
                                    pageNumber={page}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                        </div>
                    </div>
                    <div className={"bottom-row"}>
                        <div className={"slide-preview-next"}>
                            <h2>Next Slide</h2>
                            <div className={"document-renderer"}>
                                <Document file={fileUrl} className={"document-renderer"}>
                                    <Page
                                        pageNumber={page + 1}
                                        renderTextLayer={false}
                                        renderAnnotationLayer={false}
                                    />
                                </Document>
                            </div>
                        </div>
                        <div className={"slide-control"}>
                            <h2>Control Slides</h2>
                            <div>
                                <form style={{marginBottom: "1.6em"}}>
                                    <label htmlFor={"file"} className={"button upload"}>
                                        Upload PDF
                                    </label>
                                    <input
                                        id={"file"}
                                        type={"file"}
                                        onChange={ handleFileChange } />
                                </form>
                                <button className={"button start"} onClick={ handleWindowOpen }>
                                    Start Presentation
                                </button>
                                <p style={{height: "1em"}}></p>
                                <button onClick={ prevPage } className={"button previous"}>
                                    Previous
                                </button>
                                <button onClick={ nextPage } className={"button next"}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane minSize={"350px"} defaultSize={"50%"} className={"split-pane-pane-custom right"}>
                    <h1>Notes</h1>
                    <form style={{textAlign: "left", marginTop: "2^.5em"}}>
                        <label htmlFor={"file"} className={"button upload"} style={{marginLeft: "2.5em"}}>
                            Upload Markdown
                        </label>
                        <input id={"file"} type={"file"} onChange={ handleMarkdownChange } />
                    </form>
                    <MarkdownRenderer markdown={markdown} pageNumber={page} />
                </Pane>
            </SplitPane>
        </div>
    );
}

export default Sender
