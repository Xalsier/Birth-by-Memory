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
    const hiddenArticles = results.filter(article => article.hidden);
    const visibleResults = results.filter(article => !article.hidden);
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
  
    await checkForTemplate();
    checkForCharacterProfile();
    bindLinkClicks();
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
    console.log(found ? 'Template Found' : 'Template Not Found');
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