const profileButton = document.getElementById('profileButton');
const navCard = document.getElementById('navCard');
const navDescription = navCard.querySelector('.navDescription');

const buttonDescriptions = {
  'switch-bg': 'Switch: Swap between themes: Lockjaw and Viritia.',
  'market': 'Primal Market: Support Zaru so he can write & draw more content!',
  'home': 'Worldbuilding: Accessible directory for relevant page articles.'
};

let descriptionTimeout;

function toggleNavCard() {
  navCard.classList.toggle('open');
  if (navCard.classList.contains('open')) {
    navDescription.textContent = 'Birth by Memory: Lockjaw is coming early 2025!';
  } else {
    navDescription.textContent = '';
  }
}

profileButton.addEventListener('click', function(event) {
  toggleNavCard();
  event.stopPropagation();
});

Object.keys(buttonDescriptions).forEach(buttonId => {
  const button = document.getElementById(buttonId) || document.querySelector(`button[onclick*='${buttonId}']`);
  if (button) {
    button.addEventListener('mouseover', function() {
      clearTimeout(descriptionTimeout);
      descriptionTimeout = setTimeout(() => {
        navDescription.textContent = buttonDescriptions[buttonId];
      }, 300);
    });
  }
});
