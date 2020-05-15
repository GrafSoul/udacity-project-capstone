'use strict';
import { getAPIData } from './getapi';
import { setData } from './setdata';
import {definitionTemp, dataToString, msToDate, getDays} from './helpers.js'; 
/**
 * Define Global Variables
*/
const cityTrip = document.getElementById('city');
const dateTrip = document.getElementById('date');
const saveTrip = document.getElementById('save');
const localData = JSON.parse(localStorage.getItem('trips'));

let dataTrips = [];

const geoDataAPI = 'http://api.geonames.org/searchJSON?q=';
const weatherDataAPI = 'https://api.weatherbit.io/v2.0/forecast/daily?'; 
const pixabayDataAPI = 'https://pixabay.com/api/'; 
const countriesDataAPI = 'https://restcountries.eu/rest/v2/name';     

const routeURL = process.env.NODE_ENV === 'development'? 
    window.location.href === 'http://localhost:3030/'? 
        'http://localhost:3030/': 'http://localhost:3030':
    window.location.href;

/**
* @description Main function of the app.
*/
const newTrip = async () => {

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
        let weatherDailyURL = '';
        let weatherData = {};
        let tempDifference = {};

        if(amountDays) {
            weatherDailyURL = `${weatherDataAPI}lat=${lat}&lon=${lng}&key=${weatherKey}`;
            weatherData =  await getAPIData(weatherDailyURL);
            tempDifference = definitionTemp(weatherData.data); 
        }  else {
            alert('Error Days!'); 
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
            id: dateNowMs,
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
            maxTemp: tempDifference.max,
            currentMin: weatherData.data[0].min_temp,
            currentMax: weatherData.data[0].max_temp,
            currentIcon: weatherData.data[0].weather.icon,
            currentDiscr: weatherData.data[0].weather.description,
            futureMin: weatherData.data[weatherData.data.length - 1].min_temp,
            futureMax: weatherData.data[weatherData.data.length - 1].max_temp,
            futureIcon: weatherData.data[weatherData.data.length - 1].weather.icon,
            futureDiscr: weatherData.data[weatherData.data.length - 1].weather.description,
        }; 

        console.log(newDataTrip);

        // Adding new data a global variable.
        dataTrips.unshift(newDataTrip);

        // Sending updated data to the server.
        setData(`${routeURL}/set`, dataTrips);

        // Adding new data to LocalStorage.
        localStorage.setItem('trips', JSON.stringify(dataTrips));

        // Clearing the input fields.
        cityTrip.value = '';
        dateTrip.value = '';

    } else {
        alert('Error Fields!');
        return false; 
    }

};

/**
* @description Event listener for adding a new trip.
*/
saveTrip.addEventListener('click', newTrip);

/**
* @description Function for getting project data from the server or localStorage.
*/
const getData = async () => {
    if (dataTrips.length === 0 && localData !== null) {
        dataTrips = localData.reverse();

        // Adding all elements to the page.
        dataTrips.forEach(trip => {
            trip;
        });
        setData(`${routeURL}/set`, dataTrips.reverse());
    } else {
        try {
            const res = await fetch(`${routeURL}/get`);
            dataTrips = await res.json();

            // Adding all elements to the page.
            dataTrips.reverse().forEach(trip => {
                trip;
            });

        } catch(error) {
            console.log('error', error);
        }
    }
};

/**
* @description Function for getting data in load page.
*/
window.onload = () => getData();

export {newTrip};