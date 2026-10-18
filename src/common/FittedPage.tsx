import {useCallback, useEffect, useRef, useState} from "react";
import {Page, useDocumentContext} from "react-pdf";
import "./FittedPage.css";

interface BufferedPageArgs {
    pageNumber: number;
    width: number;
    visible: boolean;
    onRendered: (pageNumber: number) => void;
    onRemoved: (pageNumber: number) => void;
    onAspectRatio: (aspectRatio: number) => void;
}

/**
 * One rendered page, stacked on top of the others and hidden unless `visible`.
 */
function BufferedPage({pageNumber, width, visible, onRendered, onRemoved, onAspectRatio}: BufferedPageArgs) {
    // The page has to be rendered again when mounted the next time
    useEffect(() => () => onRemoved(pageNumber), [pageNumber, onRemoved]);

    return (
        <div className={`fitted-page-layer${visible ? "" : " hidden"}`}>
            <Page
                pageNumber={pageNumber}
                width={width}
                loading={null}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                onLoadSuccess={(page) => onAspectRatio(page.originalWidth / page.originalHeight)}
                onRenderSuccess={() => onRendered(pageNumber)}
            />
        </div>
    );
}

/**
 * Renders a PDF page as large as possible inside its positioned parent, keeping the aspect ratio.
 *
 * The page is rendered at the displayed size (instead of being scaled via CSS), so it stays sharp.
 * The previous and next pages are rendered in the background, so switching to them is instant.
 * While a page that was not pre-rendered is rendering, the last page stays visible (no blank frame).
 * Must be used inside a react-pdf `<Document>`.
 *
 * @param param0            Default parameter.
 * @param param0.pageNumber The page to render.
 */
function FittedPage({pageNumber}: {pageNumber: number}) {
    const containerRef = useRef<HTMLDivElement>(null);
    const pdf = useDocumentContext()?.pdf;
    const numPages = pdf ? pdf.numPages : pageNumber;
    const [box, setBox] = useState({width: 0, height: 0});
    const [aspectRatio, setAspectRatio] = useState(16 / 9);
    const [renderedPages, setRenderedPages] = useState<ReadonlySet<number>>(new Set());
    const [shownPage, setShownPage] = useState(pageNumber);

    useEffect(() => {
        const element = containerRef.current;
        if (!element) return;

        const observer = new ResizeObserver(([entry]) => {
            const {width, height} = entry.contentRect;
            setBox({width, height});
        });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    // Show the requested page as soon as it is rendered, until then keep the last one
    if (renderedPages.has(pageNumber) && shownPage !== pageNumber) {
        setShownPage(pageNumber);
    }

    const onRendered = useCallback((rendered: number) => {
        setRenderedPages((pages) => new Set(pages).add(rendered));
    }, []);

    const onRemoved = useCallback((removed: number) => {
        setRenderedPages((pages) => {
            const next = new Set(pages);
            next.delete(removed);
            return next;
        });
    }, []);

    const width = Math.floor(Math.min(box.width, box.height * aspectRatio));
    const pages = [...new Set([shownPage, pageNumber - 1, pageNumber, pageNumber + 1])]
        .filter((n) => n >= 1 && n <= numPages)
        .sort((a, b) => a - b);

    return (
        <div ref={containerRef} className={"fitted-page"}>
            {width > 0 && pages.map((n) => (
                <BufferedPage
                    key={n}
                    pageNumber={n}
                    width={width}
                    visible={n === shownPage}
                    onRendered={onRendered}
                    onRemoved={onRemoved}
                    onAspectRatio={setAspectRatio}
                />
            ))}
        </div>
    );
}

export default FittedPage
