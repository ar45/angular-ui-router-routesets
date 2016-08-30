### Generic routing

Provides a easy common way to get a set of views in a restful manner.

## Examples


### routes.js

```javascript
import { RouteSet } from 'angular-ui-router-routesets';

import { GenericListController, GenericDetailController } from 'angular-ui-router-routesets';


class UsersController extends  GenericListController {

    filter(term) {
        queryParams = services.getSearchQueryParams(term);
        return this.records.getList(queryParams).then( records => {
            this.records = records;
        });
    }
}

const promosRoutes = new RouteSet({
    name: 'promotions',
    url: '/promos',
    // Mask out all routes, we only have a list route
    create: null,
    view: null,
    edit: null,
});


function routes(uiRouterRouteSetsProvider, $stateProvider) {
    $stateProvider.state(promosRoutes.list);

    $stateProvider.state('base', {
        // This is where we declare sub ui-views for `list`, `detail`, and `edit`.
        template: require('./templates/overview.html'),
        abstract: true,
        // Allow for our base template to access $state
        controller: ['$state', function ($state) {
            this.$state = $state;
        }],
        controllerAs: 'routeSetCtrl',
    });

    uiRouterRouteSetsProvider.states({
        parent: 'base',
        // state basename - this will generate 4 states with the following names
        // `baseUsers`, `baseUsersEdit`, `baseUsersView`, and `baseUsersCreate`.
        name: 'users',
        url: '/users',
        // REST Api resource where to get users.
        // `/users`, `/users/<userId>`
        resourceName: '/users',
        // Inject into the ui-view addressed at `base@list`
        injectAt: 'base',
        // Use a custom controller
        list: {
            controller: UsersController,
            template: require('./users.list.html'),
        },
    })

    .states({
        parent: 'base',
        name: 'accounts',
        url: '/accounts',
        stateParamPattern: 'int',
        // Absolute url
        resourceName: '/accounts',
        //templateRequireContext: require.context('./templates'),
    })

    .states({
        // Route names get transformed into fully qualified names as camelCase.
        parent: 'baseAccountsView',
        name: 'orders',
        url: 'orders',
        // orderId state param is a uuid.
        stateParamPattern: 'uuid',
        // Relative to accounts. This results in API endpoints
        // `/accounts/<accountId>/orders`
        // `/accounts/<accountId>/orders/<orderId>`
        resourceName: 'orders',
    })
}

routes.$inject = ['uiRouterRouteSetsProvider', '$stateProvider'];

export default routes;
```


### index.js

```javascript
import angular from 'angular';
import routes from './routes.js';

export default angular.module('my.module')
    .config(routes)
    .name;
```
