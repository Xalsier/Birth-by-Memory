const initArticle = "example.md";
const dataStore = {
    articles: [],
    gallery: [],
    userProfile: {
        title: "Error Scarab",                
        color: "#ffffff",                     
        description: "To change your profile, refresh.", 
        img: null,
        errorDesc: "Error randomizing profile."                           
    },
    booleans: {
        isProfileOpen: false
    },
    files: {
        galleryCSS: false,
        imageJSON: false,
        galleryJS: false,
    }
};

const namePrefixes = [
    'Boba', 'Mocha', 'Coffee', 'Cookie', 'Soup', 'Ramen', 
    'Milk', 'Honey', 'Syrup', 'Salt', 'Pepper', 'Jelly',
    'Butter', 'Tofu', 'Sushi', 'Ink', 'Wind', 'Bamboo',
    'Coconut', 'Tea'];
const nameSuffixes = [
    'Fox', 'Rabbit', 'Raccoon', 'Fox', 'Bunny', 'Turtle', 
    'Cat', 'Moth', 'Slug', 'Hyena', 'Bee', 'Bnnuy', 'Wolf',
    'Goat', 'Llama', 'Birb', 'Raven', 'Parakeet', 'Finch'];

const resultsContainer = document.getElementById('resultsContainer');
const markdownContent = document.getElementById('markdownContent');
const markdownNav = document.getElementById('markdownNav');
const mapNavigationContainer = document.getElementById('mapNavigationContainer');
const rasterMapPlaceholder = document.getElementById('rasterMapPlaceholder');
const articleContainer = document.getElementById('articleContainer');
const mapContainer = document.getElementById('mapContainer');
let isDesktop = window.innerWidth > 768;
let openClass2 = isDesktop ? 'desktopOpen' : 'mobileOpen';
let closedClass2 = isDesktop ? 'desktopClosed' : 'mobileClosed';
const deviceType2 = isDesktop ? "desktop device." : "mobile device.";
const linkPattern = /\[\[([^\|\]]+)\|([^\]]+)\]\]|\[\[([^\-]+)-([^\]]+)\]\]/g;
const citeBookRegex = /{{citeBook\|([^}]+)}}/g;
const karmaRegex = /{{KarmaRec\|([^}]+)}}/;
const charRegex = /{{charProf\|([^}]+)}}/;
const sampleSize = 5;
resultsContainer.innerHTML = '';
function toggleNavDisplay(element) {
    if (element.style.display === 'none' || element.style.display === '') {
        element.style.display = 'block';
    } else {
        element.style.display = 'none';
    }
}