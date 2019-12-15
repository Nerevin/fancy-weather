window.onload = async function() {
    pageGenere();
    changeBG();
    document.getElementById('changeBG').onclick = changeBG;
    document.getElementById('toFar').onclick = () => {if (!document.getElementById('toFar').classList.contains('clicked')) celToFar()};
    document.getElementById('toCel').onclick = () => {if (!document.getElementById('toCel').classList.contains('clicked')) farToCel()};
    let coordinate = {
        latitude: 0,
        longitude: 0,
    };
    await getCoord().then(setCoord).then(result => {
        coordinate.latitude = result[0];
        coordinate.longitude = result[1];
    });

    this.mapInit(coordinate);
    this.setPosition(coordinate);
    this.setDate();
    setInterval(setDate, 60000); 
    this.setWeather(coordinate);
}

function celToFar() {
    let temp = document.getElementsByClassName('temp');
    let feelTemp = document.getElementById('feelTemp');
    let feelTempNum = parseInt(feelTemp.textContent.replace(/\D+/g,""));
    if (feelTemp.textContent.includes('-')) {feelTempNum = -feelTempNum}
    feelTemp.innerHTML = 'feels like: ' + Math.round((feelTempNum * 9/5) + 32) + '°';
    for (let i = 0; i < temp.length; i++) {
        let tempNum = temp[i].textContent.slice(0, -1);
        tempNum = Math.round((tempNum * 9/5) + 32);
        tempNum += '°';
        temp[i].innerHTML = tempNum;
    }
    document.getElementById('toFar').classList.add('clicked');
    document.getElementById('toCel').classList.remove('clicked');
    localStorage.setItem('temp', 'F');
}

function farToCel() {
    let temp = document.getElementsByClassName('temp');
    let feelTemp = document.getElementById('feelTemp');
    let feelTempNum = parseInt(feelTemp.textContent.replace(/\D+/g,""));
    if (feelTemp.textContent.includes('-')) {feelTempNum = -feelTempNum}
    feelTemp.innerHTML = 'feels like: ' + Math.round((feelTempNum - 32) * 5/9) + '°';
    for (let i = 0; i < temp.length; i++) {
        let tempNum = temp[i].textContent.slice(0, -1);
        tempNum = Math.round((tempNum - 32) * 5/9);
        tempNum += '°';
        temp[i].innerHTML = tempNum;
    }
    document.getElementById('toCel').classList.add('clicked');
    document.getElementById('toFar').classList.remove('clicked');
    localStorage.setItem('temp', 'C');
}

function mapInit(obj) {
    mapboxgl.accessToken = 'pk.eyJ1IjoibmVyZXZpbiIsImEiOiJjazQxbXU0YTAwMnU1M2xsZGxrZW11b2x5In0.4cmy-NbuSJyolq5okyqAQA';
    let map = new mapboxgl.Map({
    container: 'map',
    center: [obj.longitude, obj.latitude],
    zoom: 10,
    style: 'mapbox://styles/mapbox/streets-v11'
    });
}

function setCoord(result) {
    const lat = document.getElementById('latitude');
    const long = document.getElementById('longitude');
    lat.innerHTML = 'Latitude: ' + result[0];
    long.innerHTML = 'Longitude ' + result[1];
    let array = [result[0], result[1]];
    return array;
}

function getCoord() {
    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition((position) => {
            let latitude = position.coords.latitude;
            let longitude = position.coords.longitude;
            resolve([latitude, longitude]);
        });
    });
}

async function setPosition(obj) {
    let apikey = '91e869571e4a4405a4cbbf77a1c95581';
    let latitude = obj.latitude;
    let longitude = obj.longitude;
    
    let api_url = 'https://api.opencagedata.com/geocode/v1/json'

    let request_url = api_url
    + '?'
    + 'key=' + apikey
    + '&q=' + encodeURIComponent(latitude + ',' + longitude)
    + '&language=en'
    + '&pretty=1'

    let request = new XMLHttpRequest();
    request.open('GET', request_url, true);

    request.onload = function() {
        if (request.status == 200){ 
          let jsonArray = [];
          let city = document.getElementById('city');
          let data = JSON.parse(request.responseText);
          jsonArray = [data.results[0].components.country, data.results[0].components.county];
          city.innerHTML = jsonArray[1] + ' , ' + jsonArray[0];

              
        } else if (request.status <= 500){                                
          console.log("unable to geocode! Response code: " + request.status);
          let data = JSON.parse(request.responseText);
          console.log(data.status.message);
        } else {
          console.log("server error");
        }
      };

      request.onerror = function() {
        console.log("unable to connect to server");        
      };
    
    request.send();
}

function setDate() {
    let dateId = document.getElementById('dateId');
    let dayNameOne = document.getElementById('dayNameOne');
    let dayNameTwo = document.getElementById('dayNameTwo');
    let dayNameThree = document.getElementById('dayNameThree');
    let date = new Date();
    let day = date.getDate();
    let hour = date.getHours();
    let minute = date.getMinutes();
    let month = date.getMonth();
    let dayName = date.getDay();
    let currentDay;
    let firstDay;
    let secondDay;
    let thirdDay;
    const dayArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    for (let i = 0; i <dayArray.length; i++) {
        if (dayName === i) {
            currentDay = dayArray[i];
            firstDay = dayArray[i+1];
            secondDay = dayArray[i+2];
            thirdDay = dayArray[i+3];
        }
    }

    if (hour < 10) {
        hour = '0' + hour;
    }

    if (minute < 10) {
        minute = '0' + minute;
    }

    switch (month) {
        case (0):
            month = 'January';
            break;
        case (1):
            month = 'February';
            break;
        case (2):
            month = 'March';
            break;
        case (3):
            month = 'April';
            break;
        case (4):
            month = 'May';
            break;
        case (5):
            month = 'June';
            break;
        case (6):
            month = 'July';
            break;
        case (7):
            month = 'August';
            break;
        case (8):
            month = 'September';
            break;
        case (9):
            month = 'October';
            break;
        case (10):
            month = 'November';
            break;
        case 11:
            month = 'December';
            break;
    }

    dateId.innerHTML = day + ' ' + currentDay + ' ' + month + ' ' + hour + ':' + minute;
    dayNameOne.innerHTML = firstDay;
    dayNameTwo.innerHTML = secondDay;
    dayNameThree.innerHTML = thirdDay;
}

async function setWeather(obj) {
    let url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/c6b7e588df1bae2e082f6e229327249e/${obj.latitude},${obj.longitude}?units=si`;
    let request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onload = () =>  {
        if (request.status === 200) {
            function Weather(temp, summary, feel, wind, humidity, icon) {
                this.temp = temp;
                this.summary = summary;
                this.feel = feel;
                this.wind = wind;
                this.humidity = humidity;
                this.icon = icon;
            }
            let data = JSON.parse(request.responseText);
            let dataArray = [];
            dataArray = [data.currently, data.daily.data[1], data.daily.data[2], data.daily.data[3]];
            let = weatherArray = [];
            weatherArray[0] = new Weather(dataArray[0].temperature, dataArray[0].summary, dataArray[0].apparentTemperature, dataArray[0].windSpeed, dataArray[0].humidity, dataArray[0].icon);
            for (let i = 1; i < dataArray.length; i++) {
                weatherArray[i] = new Weather(dataArray[i].temperatureLow, dataArray[i].summary, dataArray[i].apparentTemperature, dataArray[i].windSpeed, dataArray[i].humidity, dataArray[i].icon);
            }
            
            let weatherTemp = document.getElementsByClassName('temp');
            for (let i = 0; i <weatherTemp.length; i++) {
                weatherTemp[i].innerHTML = Math.round(weatherArray[i].temp) + '°';
            } 

            let currentArticle = document.getElementsByClassName('currentArticle');
            currentArticle[0].innerHTML = weatherArray[0].summary;
            currentArticle[1].innerHTML = 'feels like: ' + Math.round(weatherArray[0].feel) +  '°';
            currentArticle[2].innerHTML = 'wind: ' + weatherArray[0].wind + 'm/s';
            currentArticle[3].innerHTML = 'humidity: ' + weatherArray[0].humidity*100 + '%'; 
            if (localStorage.getItem('temp') === 'F') {celToFar()}

            let weatherIcon = document.getElementsByClassName('icon');
            for (let i = 0; i < weatherIcon.length; i++) {
                weatherIcon[i].src = iconSwitch(weatherArray[i].icon);
            }
        }
    }

    request.send();
}

function iconSwitch(icon) {
    let weatherIconName = ['clear-day', 'clear-night', 'rain', 'snow', 'sleet', 'wind', 'fog', 'cloudy', 'partly-cloudy-day', 'partly-cloudy-night'];
    let weatherIconSrc = ['icon/001-sunny.svg', 'icon/012-full moon.svg', 'icon/004-rainy.svg', 'icon/009-snow.svg', 'icon/008-snow.svg', 'icon/011-wind.svg', 
    'icon/010-wind.svg', 'icon/002-cloudy.svg', 'icon/002-cloudy.svg', 'icon/016-cloudy.svg']
    for (let i = 0; i < weatherIconName.length; i++) {
        if (icon === weatherIconName[i]) {
            let src = weatherIconSrc[i];
            return src;
        }
    }
}

function changeBG() {
    let background = document.getElementById('app');
    background.style.backgroundImage = `url(background/bg${Math.floor(Math.random() * 4)}.jpg)`;
}

function pageGenere() {
    const mainMarkUp = `
<header class="header">
<div class="header-wrapper">
    <button class="header__change-background" id="changeBG"></button>
    <select class="header__change-lang" disabled>
        <option>En</option>
        <option>Ru</option>
        <option>By</option>
    </select>
    <div class="header__change-temperature">
        <button id="toFar">°F</button>
        <button id="toCel" class="clicked">°C</button>
    </div>
</div>
<form class="header__search" name="search">
    <p>
        <input type="search" placeholder="Search city or ZIP" disabled>
        <input type="submit" value="SEARCH" for="search" disabled>
    </p>
</form>
</header>
<main>
<div class="weather">
    <div class="weather__city">
        <p id="city"></p>
        <p id="dateId" class="date"></p>
    </div>
    <div class="weather__current" id="currentWeather">
        <p class="weather__current_p temp"></p>
        <img src="" alt="weather" class="icon">
        <div class="current-weather">
            <p class="currentArticle"></p>
            <p class="currentArticle" id="feelTemp"></p>
            <p class="currentArticle"></p>
            <p class="currentArticle"></p>
        </div>
    </div>
    <div class="weather__next-day">
        <div id="firstWeather">
            <p class="weather__next-day_day" id="dayNameOne"></p>
            <div>
                <p class="weather__next-day_temperature temp"></p>
                <img src="" alt="weather" class="icon">
            </div>
        </div>
        <div id="secondWeather">
            <p class="weather__next-day_day" id="dayNameTwo"></p>
            <div>
                <p class="weather__next-day_temperature temp"></p>
                <img src="" alt="weather" class="icon">
            </div>
        </div>
        <div id="thirdWeather">
            <p class="weather__next-day_day" id="dayNameThree"></p>
            <div>
                <p class="weather__next-day_temperature temp"></p>
                <img src="" alt="weather" class="icon">
            </div>
        </div>
    </div>
</div>
<div class="map">
    <div id="map" class="map__content" style="width: 400px; height: 300px;"></div>
    <p id="latitude"></p>
    <p id="longitude"></p>
</div>
</main>
`;
    document.getElementById('app').innerHTML = mainMarkUp;
}
