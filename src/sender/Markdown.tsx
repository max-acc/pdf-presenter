import './Sender.css'

/**
 * Parses Markdown into HTML elements, where each line is rendered independently (except for unordered lists).
 *
 * Each first level heading marks a new element for the output array.
 * This is done, as each slide should have its own notes.
 *
 * @param text  The array of strings to parse the data from. Each item is a line from the original markdown file.
 * @return An array of strings where each item contains HTML.
 */
function parseMarkdown(text: string[] | null) {
    if (!text) return
    let output: string[] = []
    let currentPage = -1;

    for (let line of text) {

        // Parse embedded links
        line = line.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (_match, text, url) => `<a href="${url}" target="_blank">${text}</a>`
        );

        // Parse first level heading -> e.g. creates new page
        if (/^#\s/.test(line)) {
            currentPage++;

            const match = line.match(/^#\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] = `<h2>${content}</h2>`;
        }
        // Parse second level heading
        else if (/^##\s/.test(line)) {
            const match = line.match(/^##\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] += `<h3>${content}</h3>`;
        }
        // Parse third level heading
        else if (/^###\s/.test(line)) {
            const match = line.match(/^###\s(.*)/);
            const content = match ? match[1] : "";

            output[currentPage] += `<h4>${content}</h4>`;
        }
        // Parse unordered list
        else if (/^\*\s/.test(line)) {
            const match = line.match(/^\*\s(.*)/);
            const content = match ? match[1] : "";

            if (/<\/ul>$/.test(output[currentPage])) {
                const matchWithoutEndTag = output[currentPage].match(/^(.*)<\/ul>$/);
                output[currentPage] = matchWithoutEndTag ? matchWithoutEndTag[1] + `<li>${content}</li></ul>` : output[currentPage];

            } else {
                output[currentPage] += `<ul><li>${content}</li></ul>`
            }
        }
        // If none of the above items has matched yet, the line is a paragraph by default
        else {
            if (currentPage === -1) {
                currentPage = 0;
                output[currentPage] = "";
            }

            output[currentPage] += `<p>${line}</p>`;
        }
    }

    return output
}

/**
 * Renders Markdown as HTML.
 *
 * The rendered Markdown is dependant on the current slide.
 * Each slide can have its own notes (for more information see README).
 *
 * @param param0            Default parameter.
 * @param param0.markdown   The markdown file as a array of strings, where each element is a line.
 * @param param0.pageNumber The page number of the currently displayed slide.
 * @constructor
 */
function MarkdownRenderer({markdown, pageNumber}: {markdown: string[] | null, pageNumber: number}) {
    const pageContent = parseMarkdown(markdown)

    return (
        <div className={"markdown-to-html"} dangerouslySetInnerHTML={{ __html: pageContent ? pageContent[Math.max(pageNumber - 1, 0)] || "" : "" }} />
    )
}

export default MarkdownRenderer
