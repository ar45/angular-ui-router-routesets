import angular from 'angular';
import uiRouter from 'angular-ui-router';

// https://github.com/mgonto/restangular/pull/1374
import 'restangular';
const restangular = 'restangular';


import uiRouterRouteSets from './routesets-provider.js';
import RouteSet from './routesets.js';

import {
    GenericListController,
    GenericDetailController,
} from './controllers.js';


export {
    GenericListController,
    GenericDetailController,
    RouteSet,
};

export default angular.module('angular-ui-router-routesets', [
        uiRouter, restangular,
    ])
    .provider('uiRouterRouteSets', uiRouterRouteSets)
    .name;
