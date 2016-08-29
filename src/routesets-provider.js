import RouteSet from './routesets.js';

function uiRouterRouteSets($stateProvider) {
    this.routeSet = RouteSet;
    this.states = function states(config) {
        let routes = new RouteSet(config);
        return $stateProvider
        .state(routes.list)
        .state(routes.create)
        .state(routes.view)
        .state(routes.edit);
    }

    this.$get = function $get() {
        return this;
    }
}
uiRouterRouteSets.$inject = ['$stateProvider'];


export default uiRouterRouteSets;
