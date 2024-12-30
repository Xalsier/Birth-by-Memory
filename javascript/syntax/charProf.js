async function checkForCharacterProfile() {
    console.log('Checking for Character Profile Template...');
    const markdownContent = document.getElementById('markdownContent');
    const elements = markdownContent.querySelectorAll('*'); // Select all elements to catch any containing the placeholder

    for (const element of elements) {
        if (element.nodeType === Node.ELEMENT_NODE && element.innerHTML.includes('{{charProf|')) {
            const templateMatch = element.innerHTML.match(charRegex);
            if (templateMatch) {
                const filename = templateMatch[1];
                const article = dataStore.articles.find(a => a.path === filename);
                if (article) {
                    const profileCard = createCharacterProfile(article);
                    element.innerHTML = element.innerHTML.replace(`{{charProf|${filename}}}`, '');
                    element.appendChild(profileCard);
                } else {
                    console.log('Article not found for:', filename); // Optionally log error for debugging
                    const errorProfileCard = createCharacterProfile(dataStore.errorProfile);
                    element.innerHTML = element.innerHTML.replace(`{{charProf|${filename}}}`, '');
                    element.appendChild(errorProfileCard);
                }
            }
        }
    }
}



function createCharacterProfile(charData) {
    const profileDiv = document.createElement('div');
    profileDiv.classList.add('character-profile');

    const flexContainer = document.createElement('div');
    flexContainer.classList.add('flex-container');

    const imgDiv = document.createElement('div');
    imgDiv.classList.add('img-div');

    if (charData.img) {
        // If there is an image, create and append the img element
        const img = document.createElement('img');
        img.src = `${charData.img}`;
        img.alt = 'Profile Image';
        img.classList.add('profile-img');
        imgDiv.appendChild(img);
    } else {
        // If no image, set background color to user's pastel color
        imgDiv.style.backgroundColor = dataStore.userProfile.color;
        imgDiv.classList.add('profile-img'); // Optional class for additional styling

        if (dataStore.userProfile.title !== charData.title) {
            const unavailableText = document.createElement('div');
            unavailableText.textContent = 'Image Unavailable';
            unavailableText.classList.add('unavailable-text'); // Add class for styling
            imgDiv.appendChild(unavailableText);
        }
        
    }

    const contentDiv = document.createElement('div');
    contentDiv.classList.add('content-div');

    const nameDiv = document.createElement('div');
    nameDiv.classList.add('name-div');
    const name = document.createElement('strong');
    name.textContent = charData.title;
    name.classList.add('name');
    nameDiv.appendChild(name);

    contentDiv.appendChild(nameDiv);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('description-div');
    const description = document.createElement('p');
    description.textContent = charData.description;
    description.classList.add('description');
    descriptionDiv.appendChild(description);

    contentDiv.appendChild(descriptionDiv);

    flexContainer.appendChild(imgDiv);
    flexContainer.appendChild(contentDiv);
    profileDiv.appendChild(flexContainer);

    return profileDiv;
}



function hexToRGBA(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

