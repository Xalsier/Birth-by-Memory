// references.js

const citationRegexes = {
    citeWeb: /{{citeWeb\|([^}]+)}}/g,
    citeBook: /{{citeBook\|([^}]+)}}/g,
    citeSelf: /{{citeSelf\|([^}]+)}}/g,
    citeImage: /{{citeImage\|([^}]+)}}/g // Add citeImage regex
};

const formatDate = dateString => {
    const date = new Date(dateString);
    return isNaN(date) ? dateString : date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
};

function extractPlaceholders(mdContent) {
    const citations = [];
    for (const [type, regex] of Object.entries(citationRegexes)) {
        let match;
        while ((match = regex.exec(mdContent)) !== null) {
            citations.push({ type, content: match[1], fullMatch: match[0], index: citations.length });
        }
    }
    return citations;
}

function isInternalLink(url) {
    // Assuming internal links are relative paths that do not start with 'http://' or 'https://'
    return !/^https?:\/\//i.test(url);
}

function generateReferences(citations) {
    return citations.map((citation, index) => {
        const attributes = Object.fromEntries(
            citation.content
                .split('|')
                .map(pair => pair.split('=').map(s => s.trim()))
                .filter(([key, value]) => key && value)
        );
        let refParts = [`<span id="ref-${index + 1}">${index + 1}.</span>`];
        switch (citation.type) {
            case 'citeWeb':
                // **B. Include the website name in <strong> tags**
                if (attributes.website) {
                    refParts.push(`<strong>${attributes.website}</strong>`);
                }
                // **C. Title should be a link with href being the URL**
                if (attributes.title && attributes.url) {
                    refParts.push(`<a href="${attributes.url}" target="_blank">${attributes.title}</a>`);
                } else if (attributes.title) {
                    refParts.push(`${attributes.title}`);
                } else if (attributes.url) {
                    refParts.push(`<a href="${attributes.url}" target="_blank">${attributes.url}</a>`);
                }
                if (attributes.date) {
                    refParts.push(`- Retrieved on ${formatDate(attributes.date)}`);
                }
                break;
            case 'citeBook':
                const bookParts = [];
                if (attributes.ISBN) {
                    bookParts.push(`ISBN ${attributes.ISBN}`);
                }
                if (attributes.bookName) {
                    bookParts.push(attributes.bookName);
                }
                if (bookParts.length > 0) {
                    refParts.push(bookParts.join(' '));
                }
                const volumeEpisodeParts = [];
                if (attributes.volume) {
                    volumeEpisodeParts.push(`Vol ${attributes.volume}`);
                }
                if (attributes.episode) {
                    volumeEpisodeParts.push(`Ep ${attributes.episode}`);
                }
                if (volumeEpisodeParts.length > 0) {
                    refParts.push(volumeEpisodeParts.join(', '));
                }
                if (attributes.section) {
                    refParts.push(attributes.section);
                }
                if (attributes.page) {
                    refParts.push(`Pg ${attributes.page}`);
                }
                if (attributes.quote) {
                    const truncatedQuote = attributes.quote.substring(0, 10) + '...';
                    const escapedFullQuote = attributes.quote.replace(/'/g, "&#39;");
                    refParts.push(`<span class="quote" onclick="toggleQuote(this)" data-fullquote='${escapedFullQuote}'>"${truncatedQuote}"</span>`);
                }
                if (attributes.date) {
                    refParts.push(`- Retrieved on ${formatDate(attributes.date)}`);
                }
                break;
            case 'citeSelf':
                if (attributes.link) {
                    if (isInternalLink(attributes.link)) {
                        // Format internal links using [[path|text]] syntax
                        refParts.push(`[[${attributes.link}|${attributes.link}]]`);
                    } else {
                        // External links remain as HTML anchors
                        refParts.push(`<a href="${attributes.link}" target="_blank">${attributes.link}</a>`);
                    }
                }
                if (attributes.lastEdited) {
                    refParts.push(`Last edited on ${formatDate(attributes.lastEdited)}`);
                }
                if (attributes.dateRetrieved) {
                    refParts.push(`- Retrieved on ${formatDate(attributes.dateRetrieved)}`);
                }
                break;
            case 'citeImage':
                    if (attributes.src && attributes.text) {
                        // Generate an <a> tag with data-gallery and src
                        refParts.push(`<a href="${attributes.src}" class="ImgReference" data-gallery="${attributes.src}">${attributes.text}</a>`);
                    }
                    if (attributes.date) {
                        refParts.push(`- Image from ${formatDate(attributes.date)}`);
                    }
                    if (attributes.dateRetrieved) {
                        refParts.push(`- Retrieved on ${formatDate(attributes.dateRetrieved)}`);
                    }
                    break;
        }
        return refParts.join(' ');
    });
}

function replacePlaceholders(mdContent, citations) {
    citations.forEach((citation, index) => {
        const regex = new RegExp(citation.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        mdContent = mdContent.replace(regex, `<sup id="ref-link-${index + 1}"><a href="#ref-${index + 1}" class="sup-link">[${index + 1}]</a></sup>`);
    });
    const references = generateReferences(citations);
    // **A. Display "No references available." if no references are detected**
    if (references.length === 0) {
        return mdContent.replace('{{refList}}', 'No references available.');
    } else {
        return mdContent.replace('{{refList}}', references.map(ref => `<div>${ref}</div>`).join(''));
    }
}

function processMarkdown(mdContent) {
    const citations = extractPlaceholders(mdContent);
    const mdWithPlaceholdersReplaced = replacePlaceholders(mdContent, citations);
    return mdWithPlaceholdersReplaced;
}

function toggleQuote(element) {
    const fullQuote = element.getAttribute('data-fullquote');
    const isExpanded = element.classList.toggle('expanded');
    element.innerText = isExpanded ? `"${fullQuote}"` : `"${fullQuote.substring(0, 10)}..."`;
}
