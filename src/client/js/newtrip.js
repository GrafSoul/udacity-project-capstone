/* eslint-disable no-unused-vars */
'use strict';
import { getAPIData } from './getapi';
import { setData } from './setdata';
import { definitionTemp, dataToString, msToDate, getDays } from './helpers.js'; 
/**
 * Define Global Variables
*/
const cityTrip = document.getElementById('city');
const dateTrip = document.getElementById('date');
const getTrip = document.getElementById('get');
const localData = JSON.parse(localStorage.getItem('trips'));

const resultTrip = document.getElementById('result-trip');
const listTrip = document.getElementById('list-trip');
const errorFields = document.querySelector('.error');

const modalWindow = document.querySelector('.modal');
const modalCurtain = document.querySelector('.modal-curtain');
const modalBtnDelete = document.querySelector('.btn-delete');
const modalBtnClose = document.querySelector('.btn-cancel');
const questionDelete = document.querySelector('.question-delete');

let dataTrips = [];
let isModal = false;
let isDeleted = '';

const geoDataAPI = 'http://api.geonames.org/searchJSON?q=';
const weatherDataAPI = 'https://api.weatherbit.io/v2.0/forecast/daily?'; 
const pixabayDataAPI = 'https://pixabay.com/api/'; 
const countriesDataAPI = 'https://restcountries.eu/rest/v2/name';     

const routeURL = process.env.NODE_ENV === 'development'? 
    window.location.href === 'http://localhost:3030/'? 
        'http://localhost:3030/': 'http://localhost:3030':
    window.location.href;

/**
* @description Function for creating a new entry.
*/
const newTrip = async () => {
    resultTrip.innerHTML = '';
    errorFields.style.display = 'none';
    questionDelete.style.display = 'none';
    modalWindow.classList.add('active');
    isModal = true;

    if(cityTrip.value !== '' && dateTrip.value !== '') {

        // Getting API key values from the server.
        let apiData = await getAPIData(`${routeURL}/apidata`);
        let {geoLogin, weatherKey, pixabayKey} = apiData;

        // Getting data from the service Geonames.org.
        let geoUser = `&username=${geoLogin}`;
        let geoURL = geoDataAPI + cityTrip.value + geoUser;
        let geoData = await getAPIData(geoURL);
        let {lat, lng, name, countryName} = geoData.geonames[0];      

        // Getting data from the service Weatherbit.io.
        let dateNowMs = Date.now();
        let amountDays = getDays(dateNowMs, dateTrip.value);
        let departWeather = amountDays < 15 ? amountDays : 15; 
        let weatherDailyURL = '';
        let weatherData = {};
        let tempDifference = {};

        if(amountDays) {
            weatherDailyURL = `${weatherDataAPI}lat=${lat}&lon=${lng}&key=${weatherKey}`;
            weatherData =  await getAPIData(weatherDailyURL);
            tempDifference = definitionTemp(weatherData.data);
        } else {
            errorFields.style.display = 'block';
            errorFields.innerText = 'Enter a date in the future!';
            dateTrip.value = '';
            return false;
        }

        // Getting data from the service Pixabay.com.
        let pixabayURL = `${pixabayDataAPI}?key=${pixabayKey}&q=${name}+${countryName}&image_type=photo`;
        let pixabayData =  await getAPIData(pixabayURL);

        // Getting data from the service Restcountries.eu.
        let restcountriesURL = `${countriesDataAPI}/${countryName}`;
        let restcountriesData =  await getAPIData(restcountriesURL);
        let {capital, region, subregion, timezones, population, currencies, languages, flag} = restcountriesData[0];
        
        // Object with data for the new trip.
        let newDataTrip = {
            id: `trip_${dateNowMs}`,
            city: name, 
            country: countryName,
            flag:flag,
            capital: capital,
            region: region,
            subregion: subregion,
            timezones: timezones.join(', '),
            population: population,
            currencies: dataToString(currencies, 'code'),
            languages: dataToString(languages, 'name'),
            startDay: msToDate(),
            departing: dateTrip.value.replace(/-/g, '/'),
            amount: amountDays,
            photo: pixabayData.hits[0].webformatURL,
            minTemp: tempDifference.min,
            maxTemp: tempDifference.max, //
            currentMin: weatherData.data[0].min_temp,
            currentMax: weatherData.data[0].max_temp,
            currentIcon: weatherData.data[0].weather.icon,
            currentDescr: weatherData.data[0].weather.description,
            futureMin: weatherData.data[departWeather].min_temp,
            futureMax: weatherData.data[departWeather].max_temp,
            futureIcon: weatherData.data[departWeather].weather.icon,
            futureDescr: weatherData.data[departWeather].weather.description,
        };

        templateTripResult(newDataTrip, 'result');

        // Clearing the input fields.
        cityTrip.value = '';
        dateTrip.value = '';

    } else {
        errorFields.style.display = 'block';
        errorFields.innerText = 'Enter the city and date in the input fields!';
        return false; 
    }
};

/**
* @description This function contains a template for a trip entry.
* @param {object} data - object with data for a new record.
* @param {string} key - the key entry status.
*/
const templateTripResult = (data, key) => {

    let newElement = document.createElement('div');
    newElement.classList.add('result-content');

    let tripElement = `
        <div class="result-info">
            <figure class="info-image">
                <img src="${data.photo}">
                <figcaption>City: ${data.city}</figcaption>
            </figure>
            <div>Country: ${data.country}</div>
            <div>Flag: <img src="${data.flag}"></div>
            <div>Capital: ${data.capital}</div>
            <div>Population: ${data.population}</div>
            <div>languages: ${data.languages}</div>
            <div>Timezones: ${data.timezones}</div>
            <div>Currencies: ${data.currencies}</div>
            <div>Region: ${data.region}</div>
            <div>Subregion: ${data.subregion}</div>
        </div> 

        <div class="result-trip">
            <div class="trip-to">May trip to: ${data.city}, ${data.country}</div>
            <div class="departing">Departing: ${data.departing}</div>
            <div class="btn-group">
                <button class="btn save-trip">save trip</button>
                <button class="btn remove-trip">remove trip</button>
            </div> 

            <div class="amount">${data.city}, ${data.country} is ${data.amount} days away</div>

            <div class="weather-content">
                <div class="weather-start">
                    <h2>Weather now (${data.startDay})</h2>
                    <div class="weather-icon">
                        <img src="media/${data.currentIcon}.png" />
                    </div>
                    <div class="weather-temp">
                        <div class="weather-low">Low: ${data.currentMin}</div>
                        <div class="weather-high">High: ${data.currentMax}</div>
                    </div>
                    <div class="weather-descr">${data.currentDescr}</div>
                </div>

                <div class="weather-start">
                    <h2>Weather in the future</h2>
                    <div class="weather-icon">
                        <img src="media/${data.futureIcon}.png" /> 
                    </div>
                    <div class="weather-temp">
                        <div class="weather-low">Low: ${data.futureMin}</div>
                        <div class="weather-high">High: ${data.futureMax}</div>
                    </div>
                    <div class="weather-descr">${data.futureDescr}</div>
                </div>

            </div>
            <div class="weather-range">Temperature range from ${data.minTemp} to  ${data.maxTemp}</div>
        </div>   
    `;

    newElement.innerHTML = tripElement;
    newElement.id = data.id;  

    addHandlerResult(newElement, data, key, data.id);  

    key === 'result' ? resultTrip.append(newElement) : listTrip.prepend(newElement);
};

/**
* @description Add Event listener for save and delete button for entry.
* @param {Node} newElement - new entry Node element.
* @param {object} data - object with data for a new record.
* @param {string} key - the key entry status.
*/
const addHandlerResult = (newElement, data, key, id) => {    

    let saveButton = newElement.querySelector('.save-trip');
    let removeButton = newElement.querySelector('.remove-trip'); 

    if(key === 'result') {
        questionDelete.style.display = 'none';

        saveButton.addEventListener('click', () => {       
            // Adding new data a global variable.
            dataTrips.unshift(data);

            // Sending updated data to the server.
            setData(`${routeURL}/set`, dataTrips);

            // Adding new data to LocalStorage.
            localStorage.setItem('trips', JSON.stringify(dataTrips));

            resultTrip.innerHTML = '';
            listTrip.innerHTML = '';
            getDataLoad();
            toggleModal();
        });

        removeButton.addEventListener('click', () => {
            resultTrip.innerHTML = '';            
            toggleModal();
        });
    } else {
        questionDelete.style.display = 'block';
        saveButton.style.display = 'none';

        removeButton.addEventListener('click', () => {
            isDeleted = id;
            toggleModal();
        });
    }
};

/**
* @description Function to delete the selected entry.
* @param {number} id - id deleted entry.
*/
const deleteEntry = (id) => {
    // Select the entry to be deleted and delete it.
    let trip = document.getElementById(id);
    listTrip.removeChild(trip);

    // Delete data entry from dataEntries.
    dataTrips = dataTrips.filter(item => {
        return item.id !== id;
    });
    // Updating data on the server.
    setData(`${routeURL}/update`, dataTrips.reverse());

    // Сlear localStorage and add new data.
    localStorage.setItem('trips', JSON.stringify([]));
    localStorage.setItem('trips', JSON.stringify(dataTrips.reverse()));

    // Closing the modal window.
    modalWindow.classList.remove('active');
    isModal = false;
};

/**
* @description Function for getting project data from the server or localStorage.
*/
const getDataLoad = async () => {
    if (dataTrips.length === 0 && localData !== null) {
        dataTrips = localData.reverse();

        // Adding all elements to the page.
        dataTrips.forEach(trip => {
            templateTripResult(trip, 'list');
        });
        setData(`${routeURL}/set`, dataTrips.reverse());
    } else {
        try {
            const res = await fetch(`${routeURL}/get`);
            dataTrips = await res.json();

            // Adding all elements to the page.
            dataTrips.reverse().forEach(trip => {
                templateTripResult(trip, 'list');
            }); 
            localStorage.setItem('trips', JSON.stringify(dataTrips.reverse()));           
        } catch(error) {
            console.log('error', error);
        }
    }
};

/**
* @description Switching the modal window.
*/
const toggleModal= () => {
    if(isModal) {
        modalWindow.classList.remove('active');
        isModal = false;
    } else {
        modalWindow.classList.add('active');
        isModal = true;
    }
};

/**
* @description Event listener for adding a new trip.
*/
getTrip.addEventListener('click', newTrip);

/**
* @description Event listener for city and date input field error informer.
*/
errorFields.addEventListener('mouseover', () => {
    errorFields.style.display = 'none';
});

/**
* @description Add Event listeners for close Modal window.
*/
modalCurtain.addEventListener('click', () => {
    modalWindow.classList.remove('active');
    isModal = false;
});

modalBtnClose.addEventListener('click', () => {
    modalWindow.classList.remove('active');
    isModal = false;
});

/**
* @description Add Event listeners for delete entry.
*/
modalBtnDelete.addEventListener('click', () => {
    deleteEntry(isDeleted);
});

/**
* @description Function for getting data in load page.
*/
window.onload = () => getDataLoad();

export {newTrip};