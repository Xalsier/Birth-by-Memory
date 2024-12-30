async function fetchMarkdown(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }
    return await response.text();
}

async function searchArticles(dice = false) {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    let results;
    console.log(results);
    results = query.includes("faq") || query.includes("ama")
        ? dataStore.articles.filter(article => article.ama === true)
        : dataStore.articles.filter(article =>
            ["title", "description", "img"].some(key =>
                article[key] && article[key].toLowerCase().includes(query)
            )
        );
    markdownContent.classList.add('hidden');
    markdownContent.style.display = 'none';
    await displayResults(results, dice);
    resultsContainer.classList.remove('hidden');
}

async function displayResults(results, random = false) {
    resultsContainer.style.display = 'flex';
    resultsContainer.innerHTML = '';

    // Filter out hidden articles
    const hiddenArticles = results.filter(article => article.hidden);
    const visibleResults = results.filter(article => !article.hidden);

    // If there are hidden articles, display a message
    if (hiddenArticles.length > 0) {
        const hiddenMessageCard = document.createElement('div');
        hiddenMessageCard.className = 'card';
        hiddenMessageCard.innerHTML = `<p>${hiddenArticles.length} resources have been hidden as they are non-canonical.</p>`;
        resultsContainer.appendChild(hiddenMessageCard);
    }

    if (markdownContent.style.display === 'none') {
        markdownNav.style.display = 'none';
    }

    if (visibleResults.length === 0) {
        console.log(results);
        resultsContainer.innerHTML += `
            <div class="card">
                <p>No resources could be found.</p>
            </div>`;
        return;
    }

    // Loop through the visible results and display each one
    visibleResults.forEach(async article => {
        let holder;
        const keys = Object.keys(article);
        const hasOnlyTitleAndImg = keys.length === keys.filter(key => ['title', 'img', 'hideTitle'].includes(key)).length;
        const hasRequiredFields = ['img', 'phenotypes', 'palette', 'title', 'description'].every(key => key in article) && !article.hideTitle;

        if (hasOnlyTitleAndImg && article.img) {
            holder = document.createElement('div');
            holder.className = 'card';
            const image = document.createElement('img');
            image.src = `./untitled08325/${article.img}`;
            image.alt = 'Image for ' + article.title;
            image.style.width = '100%';
            holder.appendChild(image);
        } else if (hasRequiredFields) {
            holder = createCharacterProfile(article);
            holder.onclick = () => loadMarkdown(article.path);
            holder.style.cursor = 'pointer';
        } else if (article.automation === 'pollCard') {
            holder = createPollCard(article);
            holder.style.cursor = 'pointer';
        } else {
            holder = document.createElement('div');
            holder.className = 'card';
            if (article.path) {
                holder.onclick = () => loadMarkdown(article.path);
                holder.style.cursor = 'pointer';
            }
            if (article.metaCard) {
                const metaSpan = document.createElement('span');
                metaSpan.textContent = 'DISCORD';
                metaSpan.className = 'metaCard';
                holder.appendChild(metaSpan);
            }
            if (article.ama) {
                const amaSpan = document.createElement('span');
                amaSpan.textContent = 'FAQ';
                amaSpan.className = 'amaCard';
                holder.appendChild(amaSpan);
            }
            if (!article.hideTitle && article.title) {
                const title = document.createElement('span');
                title.textContent = article.title;
                holder.appendChild(title);
            }
            if (article.automation === 'directoryList') {
                const description = await listUnavailableArticles(); // Ensure this is awaited
                article.description = description; // Update the description with the dynamic content
            }
            if (article.description) {
                const description = document.createElement('p');
                description.innerHTML = article.description; // Use innerHTML to include HTML content
                holder.appendChild(description);
            }
            if (article.htmlContent) {
                const htmlContent = document.createElement('div');
                htmlContent.innerHTML = article.htmlContent;
                holder.appendChild(htmlContent);
            }
        }
        resultsContainer.appendChild(holder);
    });

    resultsContainer.classList.remove('hidden');
}


async function loadMarkdown(path) {
    const markdown = await fetchMarkdown(path);

    const markdownHeadersRegex = /^(#|##)\s(.+)/gm;
    const htmlHeadersRegex = /<(h1|h2)(.*?)>(.+?)<\/\1>/gm;
    const tabs = [];

    let match;

    // Find the first h1 or # header as the main tab
    const mainHeader = markdown.match(/^(#\s.+)|(<h1.*?>.+?<\/h1>)/m);
    let mainHeaderTitle = "Main";
    let mainHeaderIndex = 0;

    if (mainHeader) {
        if (mainHeader[1]) { // Markdown header
            mainHeaderTitle = mainHeader[1].replace(/^#\s/, '').trim();
            mainHeaderIndex = mainHeader.index;
        } else if (mainHeader[2]) { // HTML header
            const htmlMatch = mainHeader[2].match(/<h1.*?>(.+?)<\/h1>/);
            mainHeaderTitle = htmlMatch ? htmlMatch[1].trim() : "Main";
            mainHeaderIndex = mainHeader.index;
        }
    }

    // Add the main tab with all content up to the first h2 or ## header
    const firstH2Match = markdown.match(/^(##\s.+)|(<h2.*?>.+?<\/h2>)/m);
    const mainContentEndIndex = firstH2Match ? firstH2Match.index : markdown.length;
    tabs.push({ title: mainHeaderTitle, index: 0, content: markdown.slice(0, mainContentEndIndex).trim() });

    // Handle all h2 or ## headers as subsequent tabs
    while ((match = markdownHeadersRegex.exec(markdown)) !== null) {
        if (match[1] === '##') {
            tabs.push({ title: match[2].trim(), index: match.index, content: markdown.slice(match.index).trim() });
        }
    }

    while ((match = htmlHeadersRegex.exec(markdown)) !== null) {
        if (match[1] === 'h2') {
            const startIndex = match.index;
            const endIndex = markdownHeadersRegex.lastIndex || markdown.length;
            tabs.push({ title: match[3].trim(), index: startIndex, content: markdown.slice(startIndex, endIndex).trim() });
        }
    }

    // Ensure tabs are sorted by order of appearance
    tabs.sort((a, b) => a.index - b.index);

    markdownNav.classList.remove('hidden');
    markdownNav.style.display = 'flex';
    markdownNav.innerHTML = tabs.map((tab, index) => `
        <button id="tabButton${index}">${tab.title}</button>
    `).join('');

    markdownContent.innerHTML = renderMarkdown(tabs[0].content);

    tabs.forEach((tab, index) => {
        document.getElementById(`tabButton${index}`).addEventListener('click', () => {
            markdownContent.innerHTML = renderMarkdown(tab.content);
        });
    });

    await checkForTemplate();
    checkForCharacterProfile();
    bindLinkClicks();

    Travel('prey');
}







// Basic Markdown renderer
function renderMarkdown(markdown) {
    // Allow HTML in markdown content
    let html = markdown;

    // Replace headings
    html = html.replace(/^###### (.*)$/gm, '<h6>$1</h6>');
    html = html.replace(/^##### (.*)$/gm, '<h5>$1</h5>');
    html = html.replace(/^#### (.*)$/gm, '<h4>$1</h4>');
    html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');

    // Replace bold (**text**)
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Replace italics (*text*)
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Replace horizontal rule (----)
    html = html.replace(/^----$/gm, '<hr>');

    // Convert line breaks to <br> tags
    html = html.replace(/\n/g, '<br>');

    // Wrap paragraphs
    html = html.replace(/(<br>){2,}/g, '</p><p>');
    html = '<p>' + html + '</p>';

    return html.trim();
}

async function checkForTemplate() {
    console.log('Checking for Template...');
    const paragraphs = markdownContent.querySelectorAll('p');
    let found = false;
    for (const paragraph of paragraphs) {
        if (paragraph.textContent.includes('{{KarmaRec|')) {
            await insertKarmaRecord(paragraph.textContent);
            found = true;
        }
    }
    if (found) {
        console.log('Template Found');
    } else {
        console.log('Template Not Found');
    }
}

function checkForLinks(renderedMarkdown) {
    let detectedLinks = 0;
    let convertedLinks = 0;
    renderedMarkdown = renderedMarkdown.replace(linkPattern, (match, path1, text1, path2, text2) => {
        let path, text;
        if (path1 && text1) {
            path = path1.trim();
            text = text1.trim();
        } else if (path2 && text2) {
            path = path2.trim();
            text = text2.trim();
        }
        detectedLinks++;
        if (articleExists(path)) {
            convertedLinks++;
            return `<a href="#" data-path="${path}">${text}</a>`;
        } else {
            return `<a href="#" style="color: #ff6b6b; cursor: pointer;">${text}</a>`;
        }
    });
    console.log(`Detected ${detectedLinks} links, ${convertedLinks} converted to article links successfully`);
    return renderedMarkdown;
}

function articleExists(path) {
    return dataStore.articles.some(article => article.path === path);
}

function bindLinkClicks() {
    const links = document.querySelectorAll('.markdown-content a[data-path]');
    links.forEach(link => {
        const handleLinkClick = async (event) => {
            event.preventDefault();
            try {
                const path = link.getAttribute('data-path');
                await loadMarkdown(path);
            } catch (error) {
                console.error('Error handling markdown link:', error);
            }
        };
        link.removeEventListener('click', handleLinkClick);
        link.addEventListener('click', handleLinkClick);
    });
}