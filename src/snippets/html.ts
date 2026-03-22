export const code = `\
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Color scheme designer and previewer" />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="/dist/app.css" />
    <title>Color Schemer</title>
  </head>
  <body>
    <!-- Application root -->
    <div id="app" role="main" aria-label="Color Schemer Application">
      <header class="app-header">
        <h1>Color Schemer</h1>
        <nav aria-label="Primary navigation">
          <ul>
            <li><a href="#preview">Preview</a></li>
            <li><a href="#editor">Editor</a></li>
            <li><a href="#export">Export</a></li>
          </ul>
        </nav>
      </header>
      <section id="preview">
        <br />
        <p class="hint">Select a language above to preview syntax highlighting.</p>
      </section>
    </div>
    <script type="module" src="/dist/main.js"></script>
  </body>
</html>`;
