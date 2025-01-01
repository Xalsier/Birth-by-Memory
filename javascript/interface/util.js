function Travel(param) {
    switch(param) {
        case 'forest':
            markdownContent.classList.add('hidden');
            markdownContent.style.display = 'none';
            resultsContainer.classList.remove('hidden');
            resultsContainer.style.display = 'flex';
            break;
        case 'prey':
            resultsContainer.classList.add('hidden');
            resultsContainer.style.display = 'none';
            markdownContent.style.display = 'block';
            markdownContent.classList.remove('hidden');
            break;
        default:
            console.error("Invalid parameter passed to Travel function: ", param);
            break;
    }
}

function transitionToHome() {
    Travel('forest');
}

function createPollCard(article) {
    const card = document.createElement('div');
    card.className = 'pollCard';
    if (article.title) {
        const title = document.createElement('h3');
        title.textContent = article.title;
        title.className = 'pollTitle';
        card.appendChild(title);
    }
    if (article.metaCard) {
        const metaSpan = document.createElement('span');
        metaSpan.textContent = 'DISCORD';
        metaSpan.className = 'metaTag';
        card.appendChild(metaSpan);
    }
    const container = document.createElement('div');
    container.className = 'pollContainer';
    card.appendChild(container);
    const grid = document.createElement('div');
    grid.className = 'pollGrid';
    container.appendChild(grid);
    let totalVotes = article.pollData.reduce((total, [_, votes]) => total + votes, 0);
    article.pollData.forEach(([name, votes]) => {
        const nameLabel = document.createElement('span');
        nameLabel.textContent = name;
        nameLabel.className = 'nameLabel';
        grid.appendChild(nameLabel);
        const progressBarContainer = document.createElement('div');
        progressBarContainer.className = 'progressBarContainer';
        grid.appendChild(progressBarContainer);
        const progressBar = document.createElement('div');
        progressBar.className = 'progressBar';
        progressBar.style.width = `${(votes / totalVotes) * 100}%`;
        progressBarContainer.appendChild(progressBar);
    });
    const votesSummary = document.createElement('p');
    votesSummary.className = 'votesSummary';
    votesSummary.textContent = article.pollData.map(([name, votes]) => `${name}, ${votes} vote${votes !== 1 ? 's' : ''}`).join('. ') + `. Total: ${totalVotes}.`;
    container.appendChild(votesSummary);
    return card;
}