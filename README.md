# <center> PDF Presenter </center>

**A web-based control panel for PDF presentations** with live slide control, next-slide preview, and markdown notes.
Everything runs locally in your browser, so there is no server and no accounts involved, so the data never leaves your
device.

This project was born from a common pain point when builing presentations in **LaTeX** and export them as PDFs. When 
screen-mirroring, the presenter is stuck seeing only the current slide, with no preview of what’s next and no easy way 
to keep notes visible. This PDF Presenter solves exactly that by giving a dedicated control panel _(like PowerPoint or 
Google Slides)_ while the audience sees a clean, full-screen view.

## How it works

The application is split into two browser tabs/windows:

 * **Presenter tab** _(control panel)_
   * Upload an control the PDF presentation
   * Live preview of the **current** slide
   * Preview of the **next** slide
   * Keyboard shortcuts & navigation

 * **Viewer tab**
   * Full-screen display of hte current slide only
   * Automatically stays in sync with the presenter tab

## Demo

A deployed version is available on GitHub Pages: https://max-acc.github.io/pdf-presenter/

## Features

 * Open the presentation via the control panel in another tab _(this will be shown to the user)_ and mirror the current
slide to the control panel.
 * Control the presentation using buttons or [shortcuts](#shortcuts) via the control panel
 * Preview the next slide
 * Upload notes in **Markdown** and render them inside the control panel
 * Local, so there is no network connection required after loading

## Usage

A deployment of the application is available on 
[GitHub Pages](https://max-acc.github.io/pdf-presenter/). However if you would like to deploy it locally, instructions
are provided [below](#local-deployment).

### PDF

You can upload PDFs with any aspect ratio. However, I have only tested the application with normal PDF presentations
in **16:9** format.

> [!NOTE]
> If there is any unexpected behavior, feel free to open an 
> [Issue](https://github.com/max-acc/pdf-presenter/issues).

### Markdown Notes

The application allows the upload of presentation notes in **Markdown**. However not all formatting is parsed, sine
support for some features was intentionally deprioritized.

Currently supported formatting include:

 * Headings (`#`, `##`, `###`)
 * Unordered lists _(first level only)_
 * Links (`[text](url)`)

> [!IMPORTANT]
> All formatting **except links** must start at the beginning of the line.
> This is a deliberate simplification to keep the parser lightweight, so please keep it in mind when writing your notes.

> [!NOTE]
> If there is formatting you would really like to see, feel free to open an
> [Issue](https://github.com/max-acc/pdf-presenter/issues).

### Shortcuts

| Action     | Shortcuts                   |
|------------|-----------------------------|
| Previous Slide | `p`, `Left Arrow`       |
| Next Slide | `n`, `Right Arrow`, `Space` |

> [!NOTE]
> If there are any shortcuts you would like to see added, feel free to open an
> [Issue](https://github.com/max-acc/pdf-presenter/issues).

## Local Deployment

To run the project locally, download this repository and build it yourself:

1. Clone Repository ```git clone https://github.com/max-acc/pdf-presenter.git```
2. Change Directory ```cd pdf-presenter```
3. Install Dependencies ```npm ci```
4. Build Project ```npm run build```
5. Open the control panel in your Browser ```http://localhost:5173/pdf-presenter/```. This may vary based on your
Browser.

> [!IMPORTANT]
> You need `Node.js` and `npm` installed.
