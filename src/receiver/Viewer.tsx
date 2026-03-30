import { useRef, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf"

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
).toString();

function Viewer() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [page, setPage] = useState(1);
    const [fileUrl, setFileUrl] = useState<File | null>(null);
    const [scale, setScale] = useState(1);
    const [pageDims, setPageDims] = useState<{width: number, height: number}>({width: 1, height: 1});


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
                console.log(msg)
                setFileUrl(msg.url);
                setPage(1);
            }
        };

        return () => channel.close();
    }, []);

    // When PDF loads, get original page size
    const onDocumentLoadSuccess = (pdf: any) => {
        pdf.getPage(1).then((page: any) => {
            const viewport = page.getViewport({ scale: 1 });
            setPageDims({ width: viewport.width, height: viewport.height });
        });
    };

    // Recalculate scale on mount, window resize, or pageDims change
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            const scaleX = clientWidth / pageDims.width;
            const scaleY = clientHeight / pageDims.height;
            setScale(Math.min(scaleX, scaleY)); // fit entirely, no cropping
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [pageDims]);

    /*function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
        setPage(numPages);
    }*/

    return (
        <div ref={containerRef} style={{ position: "absolute", top: "0", left: "0", width: "100%", height: "100vh", background: "black", overflow: "hidden", margin: "auto" }}>
            <ResponsivePDF fileUrl={fileUrl} pageNumber={page}>

            </ResponsivePDF>
        </div>
    );
}

export default Viewer;

function ResponsivePDF({ fileUrl, pageNumber }: { fileUrl: File | null, pageNumber: number }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [pageDims, setPageDims] = useState<{width: number, height: number}>({width: 1, height: 1});

    // When PDF loads, get original page size
    const onDocumentLoadSuccess = (pdf: any) => {
        pdf.getPage(1).then((page: any) => {
            const viewport = page.getViewport({ scale: 1 });
            setPageDims({ width: viewport.width, height: viewport.height });
        });
    };

    // Recalculate scale on mount, window resize, or pageDims change
    useEffect(() => {
        const updateScale = () => {
            if (!containerRef.current) return;
            const { clientWidth, clientHeight } = containerRef.current;
            const scaleX = clientWidth / pageDims.width;
            const scaleY = clientHeight / pageDims.height;
            setScale(Math.min(scaleX, scaleY)); // fit entirely, no cropping
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, [pageDims]);

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                overflow: "hidden",
                background: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <Document file={fileUrl} onLoadSuccess={onDocumentLoadSuccess}>
                <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                />
            </Document>
        </div>
    );
}