const profileButton = document.getElementById('profileButton');
const navCard = document.getElementById('navCard');

function toggleNavCard() {
  navCard.classList.toggle('open');
}

profileButton.addEventListener('click', function(event) {
  toggleNavCard();
  event.stopPropagation();
});