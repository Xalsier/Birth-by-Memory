const huntCache = [];
let titleTracker = [];

function getBestTitle(titles) {
    const titleCounts = {};
    titles.forEach(([count, title]) => {
        titleCounts[count] = titleCounts[count] || [];
        titleCounts[count].push(title);
    });
    const highestCount = Math.max(...Object.keys(titleCounts).map(Number));
    return titleCounts[highestCount][0];
}

async function fetchMarkdown(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('Network error: ' + response.statusText);
        return await response.text();
    } catch (error) {
        console.error('Fetch error:', error.message);
        try {
            const fallback = await fetch('debug/empty.md');
            return fallback.ok ? fallback.text() : Promise.reject();
        } catch (fallbackError) {
            console.error('Fallback error:', fallbackError.message);
            throw fallbackError;
        }
    }
}

async function loadMarkdown(path) {
    const markdown = await fetchMarkdown(path);

    // Parse the HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(markdown, "text/html");
    const anchorTags = doc.querySelectorAll("a[onclick^='loadMarkdown']");

    const discoveredLinks = [];

    anchorTags.forEach((anchor) => {
        const onclick = anchor.getAttribute("onclick");
        const pathMatch = onclick.match(/loadMarkdown\('([^']+)'\)/);
        if (!pathMatch) return;

        const link = {
            path: pathMatch[1],
            img: anchor.getAttribute("dataimg") || null,
            description: anchor.getAttribute("datadescription") || null,
            class: anchor.getAttribute("dataclass") || null,
            title: anchor.textContent.trim(),
        };

        discoveredLinks.push(link);
    });

    // Batch update huntCache with discovered links
    discoveredLinks.forEach(link => {
        const existingArticle = huntCache.find(article => article.path === link.path);
        if (!existingArticle) {
            huntCache.push({
                title: link.title,
                description: link.description || "No description available",
                path: link.path,
                img: link.img,
                class: link.class
            });
        } else {
            // Update existing article if new data is available
            if (link.description) existingArticle.description = link.description;
            if (link.img) existingArticle.img = link.img;
            if (link.class) existingArticle.class = link.class;
        }
    });

    console.log("Updated huntCache:", huntCache);

    // Current article handling
    const titlesForPath = titleTracker.filter(([,,p]) => p === path);
    const bestTitle = titlesForPath.length ? getBestTitle(titlesForPath) : "Untitled";

    if (!huntCache.some(a => a.path === path)) {
        huntCache.push({
            title: bestTitle,
            description: "No description available",
            path: path,
            img: null,
            class: null
        });
    }

    // Render the markdown content
    const markdownHeadersRegex = /^(#|##)\s(.+)/gm;
    const htmlHeadersRegex = /<(h1|h2)(.*?)>(.+?)<\/\1>/gm;
    const headers = [];
    let mainHeaderTitle = "Main";
    let mainHeaderIndex = 0;
    const mainHeaderMatch = markdown.match(/^(#\s.+)|(<h1.*?>.+?<\/h1>)/m);
    if (mainHeaderMatch) {
        if (mainHeaderMatch[1]) {
            mainHeaderTitle = mainHeaderMatch[1].replace(/^#\s/, "").trim();
        } else if (mainHeaderMatch[2]) {
            const htmlMatch = mainHeaderMatch[2].match(/<h1.*?>(.+?)<\/h1>/);
            if (htmlMatch) {
                mainHeaderTitle = htmlMatch[1].trim();
            }
        }
    }
    headers.push({
        title: mainHeaderTitle,
        index: 0,
    });
    let mdMatch;
    while ((mdMatch = markdownHeadersRegex.exec(markdown)) !== null) {
        const level = mdMatch[1];
        const titleText = mdMatch[2].trim();
        if (level === "##") {
            headers.push({
                title: titleText,
                index: mdMatch.index,
            });
        }
    }
    let htmlMatch;
    while ((htmlMatch = htmlHeadersRegex.exec(markdown)) !== null) {
        const level = htmlMatch[1];
        const titleText = htmlMatch[3].trim();
        if (level === "h2") {
            headers.push({
                title: titleText,
                index: htmlMatch.index,
            });
        }
    }
    headers.sort((a, b) => a.index - b.index);
    const tabs = [];
    for (let i = 0; i < headers.length; i++) {
        const currentHeader = headers[i];
        const nextHeader = headers[i + 1];
        const start = currentHeader.index;
        const end = nextHeader ? nextHeader.index : markdown.length;
        const content = markdown.slice(start, end).trim();
        tabs.push({
            title: currentHeader.title,
            index: start,
            content,
        });
    }
    markdownNav.classList.remove("hidden");
    markdownNav.style.display = "flex";
    markdownNav.innerHTML = tabs
        .map((tab, index) => `<button id="tabButton${index}">${tab.title}</button>`)
        .join("");
    markdownContent.innerHTML = renderMarkdown(tabs[0].content);
    tabs.forEach((tab, index) => {
        document.getElementById(`tabButton${index}`).addEventListener("click", () => {
            markdownContent.innerHTML = renderMarkdown(tab.content);
        });
    });
    Travel('prey');
}

function renderMarkdown(markdown) {
    let html = markdown;
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/^----$/gm, '<hr>');
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<br>){2,}/g, '</p><p>');
    html = '<p>' + html + '</p>';
    return html.trim();
}

function displayResults(results) {
    resultsContainer.style.display = 'flex';
    resultsContainer.innerHTML = '';
    const validResults = results.filter(article => article?.title?.trim() && article?.path?.trim());
    if (markdownContent.style.display === 'none') {
        markdownNav.style.display = 'none';
    }
    if (validResults.length === 0) {
        const noResourceCard = document.createElement('div');
        noResourceCard.className = 'card';
        noResourceCard.onclick = () => loadMarkdown('pages/home.md');
        noResourceCard.style.cursor = 'pointer';
        noResourceCard.innerHTML = `<p>No resources could be found, click to return to the main directory.</p>`;
        resultsContainer.appendChild(noResourceCard);
        return;
    }
    validResults.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => loadMarkdown(article.path);
        card.style.cursor = 'pointer';
        const title = document.createElement('h3');
        title.textContent = article.title;
        card.appendChild(title);
        const description = document.createElement('p');
        description.textContent = article.description || "No description available";
        card.appendChild(description);
        resultsContainer.appendChild(card);
    });
}

async function searchArticles(dice = false) {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    let results;
    results = query.includes("faq") || query.includes("ama")
        ? huntCache.filter(article => article.ama === true)
        : huntCache.filter(article =>
            ["title", "description", "img"].some(key =>
                article[key] && article[key].toLowerCase().includes(query)
            )
        );
    markdownContent.classList.add('hidden');
    markdownContent.style.display = 'none';
    await displayResults(results, dice);
    resultsContainer.classList.remove('hidden');
}

function articleExists(path) {
    return huntCache.some(article => article.path === path);
}