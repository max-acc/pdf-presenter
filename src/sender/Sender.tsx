import React, {useEffect, useState} from 'react';
import {Document, Page} from "react-pdf";
import {Pane, SplitPane} from "react-split-pane";
import './Sender.css'

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
    const [numPages, setNumPages] = useState(0);

    function handleWindowOpen() {
        if (!file) {
            alert("Please upload a PDF first");
            return;
        }
        const url = URL.createObjectURL(file);
        setFileUrl(url);

        window.open("../receiver", "_blank", "width=1200,height=800");
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

    return (
        <div className="sender">
            <SplitPane direction={"horizontal"} className={"split-pane-custom"}>
                <Pane minSize={"560px"} defaultSize={"50%"} className={"split-pane-pane-custom left"}>
                    <div style={{display: "block"}}>
                        <h2 style={{width: "100%"}}>Current Slide</h2>
                        <Document file={fileUrl} onLoadSuccess={({ numPages }) => setNumPages(numPages)} className={"document-renderer"}>
                            <Page
                                pageNumber={page}
                                renderTextLayer={false}
                                renderAnnotationLayer={false}
                            />
                        </Document>
                    </div>
                    <div>
                        <div>
                            <h3>Next Slide</h3>
                            <Document file={fileUrl} className={"document-renderer"}>
                                <Page
                                    pageNumber={page + 1}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                />
                            </Document>
                            <button onClick={ handleWindowOpen }>
                                Start Presentation
                            </button>
                            <form>
                                <input id={"file"} type={"file"} onChange={ handleFileChange } />
                            </form>
                        </div>
                        <div>
                            <h3>Control Slides</h3>
                            <div>
                                <button onClick={ prevPage } className={"page-button previous"}>
                                    Previous
                                </button>
                                <button onClick={ nextPage } className={"page-button next"}>
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </Pane>
                <Pane minSize={"300px"} defaultSize={"50%"} className={"split-pane-pane-custom right"}>
                    <h2 style={{width: "100%"}}>Markdown Script</h2>
                </Pane>
            </SplitPane>
        </div>
    );
}

export default Sender
