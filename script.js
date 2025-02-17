const apiKey = "7537985c3b4d427498d01454251102";
const weatherDiv = document.getElementById("weather");

function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            getWeatherByCoords(lat, lon);
        }, (error) => {
            showError("Géolocalisation refusée ou indisponible.");
        });
    } else {
        showError("La géolocalisation n'est pas supportée par votre navigateur.");
    }
}

async function getWeatherByCoords(lat, lon) {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&lang=fr`;
    fetchWeather(url);
}

async function getWeatherByCity() {
    const city = document.getElementById("city").value;
    if (!city) return;

    const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${city}&days=3&lang=fr`;
    fetchWeather(url);
}

async function fetchWeather(url) {
    weatherDiv.innerHTML = `<div class="loader"></div>`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Impossible de récupérer la météo.");

        const data = await response.json();
        displayWeather(data);
        displayForecast(data.forecast.forecastday); // Afficher les prévisions
    } catch (error) {
        showError(error.message);
    }
}

function displayWeather(data) {
    const iconUrl = `https:${data.current.condition.icon}`;
    weatherDiv.innerHTML = `
        <h2>${data.location.name}, ${data.location.country}</h2>
        <p><i class="fas fa-thermometer-half"></i> Température : ${data.current.temp_c}°C</p>
        <p><i class="fas fa-wind"></i> Vent : ${data.current.wind_kph} km/h</p>
        <p><i class="fas fa-cloud"></i> Condition : ${data.current.condition.text}</p>
        <img src="${iconUrl}" alt="Météo">
    `;
}


let weatherChartInstance = null; // Variable pour stocker l'instance du graphique
// Fonction pour créer un graphique avec Chart.js
function createWeatherChart(forecastDays) {
    const ctx = document.getElementById('weatherChart').getContext('2d');

    // Détruire le graphique existant s'il y en a un
    if (weatherChartInstance) {
        weatherChartInstance.destroy();
    }

    // Extraire les données pour le graphique
    const labels = forecastDays.map(day => 
        new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })
    );
    const maxTemps = forecastDays.map(day => day.day.maxtemp_c);
    const minTemps = forecastDays.map(day => day.day.mintemp_c);

    // Créer le nouveau graphique
    weatherChartInstance = new Chart(ctx, {
        type: 'line', // Type de graphique (ligne)
        data: {
            labels: labels, // Jours de la semaine
            datasets: [
                {
                    label: 'Température maximale (°C)',
                    data: maxTemps,
                    borderColor: '#FF6B6B',
                    backgroundColor: 'rgba(255, 107, 107, 0.2)',
                    fill: true,
                },
                {
                    label: 'Température minimale (°C)',
                    data: minTemps,
                    borderColor: '#00B4DB',
                    backgroundColor: 'rgba(0, 180, 219, 0.2)',
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Prévisions de température sur 3 jours'
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Température (°C)'
                    }
                }
            }
        }
    });
}

function displayForecast(forecastDays) {
    let forecastHTML = "<h3>Prévisions sur 3 jours :</h3>";
    forecastHTML += '<div id="forecast-container">';
    forecastDays.forEach(day => {
        forecastHTML += `
            <div class="forecast-day">
                <p>📅 ${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'long' })}</p>
                <p>🌡️ Max : ${day.day.maxtemp_c}°C / Min : ${day.day.mintemp_c}°C</p>
                <p>🌦️ Condition : ${day.day.condition.text}</p>
                <img src="https:${day.day.condition.icon}" alt="Météo">
            </div>
        `;
    });
    forecastHTML += '</div>';
    
    // Injecter les prévisions dans le conteneur #forecast
    document.getElementById('forecast').innerHTML = forecastHTML;

    // Appeler la fonction pour créer le graphique
    createWeatherChart(forecastDays);
}
function showError(message) {
    weatherDiv.innerHTML = `<p class="error">❌ Erreur : ${message}</p>`;
}


window.onload = function () {
    // Effacer la valeur de l'input "city" au chargement de la page
    const cityInput = document.getElementById("city");
    cityInput.value = "";

    // Appeler la fonction getLocation() pour obtenir la météo par défaut
    getLocation();
};
const toggleThemeButton = document.getElementById("toggle-theme");
toggleThemeButton.onclick = () => {
    document.body.classList.toggle("dark-mode");
    toggleThemeButton.textContent = document.body.classList.contains("dark-mode") ? "☀️ Mode Clair" : "🌙 Mode Sombre";
};
toggleThemeButton.onclick = () => {
    document.body.classList.toggle("dark-mode");
    toggleThemeButton.textContent = document.body.classList.contains("dark-mode") ? "☀️ Mode Clair" : "🌙 Mode Sombre";
};
document.body.insertBefore(toggleThemeButton, document.querySelector("h1"));

