import { useEffect, useState } from "react";
import { Document, pdfjs } from "react-pdf"
import FittedPage from "../common/FittedPage";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

function Viewer() {
    const [page, setPage] = useState(1);
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        const channel = new BroadcastChannel("pdf-presenter")

        channel.postMessage({type: "READY"})

        channel.onmessage = (event) => {
            const msg = event.data;

            if (msg.type === "NEXT_PAGE") {
                setPage((p) => p + 1);
            } else if (msg.type === "PREV_PAGE") {
                setPage((p) => p - 1);
            } else if (msg.type === "SET_PAGE") {
                setPage(msg.page);
            } else if (msg.type === "LOAD_PDF") {
                setFile(msg.file);
                setPage(msg.page ?? 1);
            }
        };

        return () => channel.close();
    }, []);

    return (
        <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100vh", background: "black", overflow: "hidden", margin: "auto" }}>
            {file && (
                <Document file={file} loading={null}>
                    <FittedPage pageNumber={page} />
                </Document>
            )}
        </div>
    );
}

export default Viewer;
