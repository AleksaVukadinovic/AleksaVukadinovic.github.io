const themeToggle = document.getElementById('theme-toggle');
const settingsToggle = document.getElementById('settings-toggle');
const settingsMenu = document.getElementById('settings-menu');
const themeOptions = document.querySelectorAll('.theme-option');
const languageOptions = document.querySelectorAll('.language-option');
const body = document.body;
const mobileMenu = document.getElementById('mobile-menu');
const navLinks = document.querySelector('.nav-links');
const yearField = document.getElementById('current-year');

const savedTheme = localStorage.getItem('theme') || 'light';
setTheme(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = localStorage.getItem('theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
});

settingsToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('active');
});

document.addEventListener('click', (e) => {
    if (!settingsMenu.contains(e.target) && !settingsToggle.contains(e.target)) {
        settingsMenu.classList.remove('active');
    }
});

themeOptions.forEach(option => {
    const theme = option.getAttribute('data-theme');
    
    if (theme === savedTheme) {
        option.classList.add('active');
    }
    
    option.addEventListener('click', () => {
        setTheme(theme);
        themeOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        settingsMenu.classList.remove('active');
    });
});

function setTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme', 'sunset-theme', 'ocean-theme', 'forest-theme', 'night-theme');    
    body.classList.add(`${theme}-theme`);
    
    themeToggle.innerHTML = theme === 'dark' || theme === 'night' ? '☀️' : '🌙';
    
    localStorage.setItem('theme', theme);
    
    themeOptions.forEach(option => {
        const optionTheme = option.getAttribute('data-theme');
        option.classList.toggle('active', optionTheme === theme);
    });
}

languageOptions.forEach(option => {
    const lang = option.getAttribute('data-lang');
    const savedLang = localStorage.getItem('language') || 'en';
    
    if (lang === savedLang) {
        option.classList.add('active');
    }
    
    option.addEventListener('click', () => {
        localStorage.setItem('language', lang);
        languageOptions.forEach(o => o.classList.remove('active'));
        option.classList.add('active');
        settingsMenu.classList.remove('active');
        console.log(`Language switched to: ${lang}`);
    });
})

yearField.textContent = String(new Date().getFullYear());