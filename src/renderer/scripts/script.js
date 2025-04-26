//set date and time
function formatDateTime() {
    const now = new Date();

    const weekday = now.toLocaleString('en-US', { weekday: 'short' });
    const month = now.toLocaleString('en-US', { month: 'long' });
    const day = now.getDate().toString().padStart(2, '0');
    const year = now.getFullYear();

    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const formattedHour = hours.toString().padStart(2, '0');

    return `${weekday}, ${month} ${day}, ${year} | ${formattedHour}:${minutes} ${ampm}`;
  };

  function updateDateTime() {
    const dateElement = document.getElementById('datetime');
    if (dateElement) {
      dateElement.textContent = formatDateTime();
    }
  }


// custom article select function 
function setupArticleSelect() {
    const articleSelect = document.getElementById('articleSelect');
    const customArticle = document.getElementById('customArticle');
    const clearArticle = document.getElementById('clearArticle');

    if (!articleSelect || !customArticle || !clearArticle) return;

    articleSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            articleSelect.style.display = 'none';
            customArticle.style.display = 'block';
            clearArticle.style.display = 'block';
            customArticle.focus();
        }
    });

    clearArticle.addEventListener('click', function () {
        articleSelect.style.display = 'block';
        customArticle.style.display = 'none';
        clearArticle.style.display = 'none';
        articleSelect.value = 'Necklace';
        customArticle.value = '';
    });
}


// custom duration select function 
function setupDurationSelect() {
    const durationSelect = document.getElementById('durationSelect');
    const customDuration = document.getElementById('customDuration');
    const clearDuration = document.getElementById('clearDuration');

    if (!durationSelect || !customDuration || !clearDuration) return;

    durationSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            durationSelect.style.display = 'none';
            customDuration.style.display = 'block';
            clearDuration.style.display = 'block';
            customDuration.focus();
        }
    });

    clearDuration.addEventListener('click', function () {
        durationSelect.style.display = 'block';
        customDuration.style.display = 'none';
        clearDuration.style.display = 'none';
        durationSelect.value = '1';
        customDuration.value = '';
    });
}





document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    setupArticleSelect();
    setupDurationSelect();
});