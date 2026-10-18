import { useEffect, useState } from "react";
import { Document, pdfjs } from "react-pdf"
import FittedPage, {type LaserPosition} from "../common/FittedPage";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

function Viewer() {
    const [page, setPage] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [laser, setLaser] = useState<LaserPosition | null>(null);
    const [blank, setBlank] = useState<"black" | "white" | null>(null);

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
                setLaser(null);
            } else if (msg.type === "LASER") {
                setLaser(msg.position);
            } else if (msg.type === "BLANK") {
                setBlank(msg.color);
            }
        };

        return () => channel.close();
    }, []);

    return (
        <div style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100vh", background: "black", overflow: "hidden", margin: "auto" }}>
            {file && (
                <Document file={file} loading={null}>
                    <FittedPage pageNumber={page} laser={laser} />
                </Document>
            )}
            {blank && <div style={{ position: "absolute", inset: 0, zIndex: 1, background: blank }} />}
        </div>
    );
}

export default Viewer;
