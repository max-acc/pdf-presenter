
function parseMarkdown(text: string[] | null) {
    if (!text) return
    let output: string[] = []
    let currentPage = -1;

    for (const line of text) {
        if (/^#\s/.test(line)) {
            currentPage++;

            const match = line.match(/^#\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] = `<h2>${content}</h2>`;
        } else if (/^##\s/.test(line)) {
            const match = line.match(/^##\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] += `<h3>${content}</h3>`;
        } else if (/^###\s/.test(line)) {
            const match = line.match(/^###\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] += `<h4>${content}</h4>`;
        } else if (/^\*\s/.test(line)) {
            const match = line.match(/^\*\s(.*)/);
            const content = match ? match[1] : "";

            if (/<\/ul>$/.test(output[currentPage])) {
                const matchWithoutEndTag = output[currentPage].match(/^(.*)<\/ul>$/);
                output[currentPage] = matchWithoutEndTag ? matchWithoutEndTag[1] + `<li>${content}</li></ul>` : output[currentPage];

            } else {
                output[currentPage] += `<ul><li>${content}</li></ul>`
            }
        } else {
            if (currentPage === -1) {
                currentPage = 0;
                output[currentPage] = "";
            }

            output[currentPage] += `<p>${line}</p>`;
        }
    }

    return output
}

function MarkdownRenderer({markdown, pageNumber}: {markdown: string[] | null, pageNumber: number}) {
    const pageContent = parseMarkdown(markdown)

    return (
        <div dangerouslySetInnerHTML={{ __html: pageContent ? pageContent[Math.max(pageNumber - 1, 0)] || "" : "" }} />
    )
}

export default MarkdownRenderer
