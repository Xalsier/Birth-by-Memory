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
async function openProfile() {
    // Access isProfileOpen from dataStore.booleans
    if (dataStore.booleans.isProfileOpen) {
        resultsContainer.innerHTML = '';
    } else {
        Travel('forest');
        resultsContainer.innerHTML = '';
        const userProfileCard = createCharacterProfile(dataStore.userProfile);
        resultsContainer.appendChild(userProfileCard);
    }

    // Toggle the value of isProfileOpen in dataStore
    dataStore.booleans.isProfileOpen = !dataStore.booleans.isProfileOpen;
}


async function refreshUserProfileCard() {
    resultsContainer.innerHTML = '';
    const userProfileCard = createCharacterProfile(dataStore.userProfile);
    resultsContainer.appendChild(userProfileCard);
    const profileCustomizationCard = await createProfileCustomizationCard();
    resultsContainer.appendChild(profileCustomizationCard);
    const maxNameLength = 10;
    const profileName = document.getElementById('profileNameIndicator');
    const truncatedName = dataStore.userProfile.title.length > maxNameLength 
        ? dataStore.userProfile.title.slice(0, maxNameLength) + '...' 
        : dataStore.userProfile.title;
    profileName.innerHTML = truncatedName;
    const profileButton = document.getElementById('profileButton');
    profileButton.style.backgroundColor = dataStore.userProfile.color;
}

async function randomizeUserProfile() {
    const randomName = `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]} ${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}`;
    const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];
    dataStore.userProfile.title = randomName;
    dataStore.userProfile.color = randomColor;
    delete dataStore.userProfile.img;
    await refreshUserProfileCard();
    const profileButton = document.getElementById('profileButton');
    profileButton.style.backgroundColor = randomColor;
}

function generatePastelColors(count) {
    let colors = [];
    for (let i = 0; i < count; i++) {
        const hue = Math.floor(Math.random() * 360);
        const saturation = 60 + Math.floor(Math.random() * 30);
        const lightness = 75 + Math.floor(Math.random() * 15);
        colors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
    }
    return colors;
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

const pastelColors = generatePastelColors(256);

async function generateRandomUserProfile() {
    const randomName = `${namePrefixes[Math.floor(Math.random() * namePrefixes.length)]} ${nameSuffixes[Math.floor(Math.random() * nameSuffixes.length)]}`;
    const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

    // Function to darken or lighten the color
    function adjustColor(color, amount) {
        let usePound = false;

        if (color[0] === "#") {
            color = color.slice(1);
            usePound = true;
        }

        const num = parseInt(color, 16);
        let r = (num >> 16) + amount;
        let g = ((num >> 8) & 0x00FF) + amount;
        let b = (num & 0x0000FF) + amount;

        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));

        return (usePound ? "#" : "") + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }

    const darkerColor = adjustColor(randomColor, -30); // Darker pastel for the button
    const lighterColor = adjustColor(randomColor, 50); // Lighter pastel for the name

    dataStore.userProfile = {
        title: randomName,
        color: randomColor,
        description: dataStore.userProfile.description
    };

    const profileButton = document.getElementsByClassName('profileButton')[0];
    if (profileButton) {
        profileButton.style.backgroundColor = darkerColor;
    }

    const maxNameLength = 15;
    const profileName = document.getElementById('profileNameIndicator');
    if (profileName) {
        profileName.style.setProperty('color', lighterColor, 'important');
        const truncatedName = dataStore.userProfile.title.length > maxNameLength 
            ? dataStore.userProfile.title.slice(0, maxNameLength) + '...' 
            : dataStore.userProfile.title;
        profileName.innerHTML = truncatedName;
    }
}