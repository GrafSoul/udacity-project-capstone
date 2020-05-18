'use strict';
import { newTrip } from './js/newtrip';
import { getAPIData } from './js/getapi';
import { setData } from './js/setdata';
import { templateTrip } from './js/template';
import {definitionTemp, dataToString, msToDate, getDays} from './js/helpers.js'; 

import './styles/styles.scss';

export { newTrip, getAPIData, setData, templateTrip, getDays, msToDate, definitionTemp, dataToString };