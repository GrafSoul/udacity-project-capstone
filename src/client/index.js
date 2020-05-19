'use strict';
import { App } from './js/app';
import { getAPIData } from './js/getapi';
import { setData } from './js/setdata';
import { templateTrip } from './js/template';
import { definitionTemp, dataToString, getDate, getDays } from './js/helpers.js'; 

App();

import './styles/styles.scss';

export { App, getAPIData, setData, templateTrip, getDays, getDate, definitionTemp, dataToString };