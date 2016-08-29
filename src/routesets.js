import _ from 'lodash';
import assert from 'assert';
import pluralize from 'pluralize';

import {
    GenericListController,
    GenericDetailController,
} from './controllers.js';


const stateParamPatterns = {
    int: '\\d+',
    uuid: '[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}',
    str: '\\S+',
}


function tryLoadTemplate(requireContext, template) {
    try {
        return requireContext(template);
    } catch (e) {

    }
}


function defineRoute ({
    name,
    parent,
    stateParamKey,
    stateParamPattern,
    list: listConfig,
    create: createConfig,
    view: viewConfig,
    edit: editConfig, }) {
        let baseName = parent ? `${parent}.${name}` : name;
        let list = baseName;
        let create = `${baseName}.create`;
        let view = `${baseName}.view`;
        let edit = `${view}.edit`;
        let routeDefinition = {
            list: listConfig ? list : null,
            create: createConfig ? create : null,
            view: viewConfig ? view : null,
            edit: editConfig ? edit : null,
            stateParamPattern: stateParamPatterns[stateParamPattern] || stateParamPattern,
            stateParamKey,
        };

        let detailParentRoute = listConfig ? list : parent;
        let editParentRoute = viewConfig ? view : detailParentRoute;

        return {
            detailParentRoute,
            editParentRoute,
            routeDefinition,
        };
}


class RouteSet {
    constructor({
        name,
        url: baseUrl,
        templateRequireContext = require.context('./templates/'),
        resource = name,
        resourceName = pluralize.plural(resource),
        stateParamKey = `${ pluralize.singular(resourceName.split('/').pop()) }Id`,
        stateParamPattern = 'int',
        parent = null,
        injectAt = `${parent || ''}`,
        list = {},
        create = {},
        view = {},
        edit = {},
    }) {
        assert(name, 'You did not provide a name for this route.');
        assert(baseUrl, 'You did not set a url for this route');
        let { detailParentRoute, editParentRoute, routeDefinition } =
             defineRoute({ name, parent, stateParamKey, stateParamPattern, list, create, view, edit });

        if (list !== null)
            this.list = listRouteFactory(
                { name, routeDefinition, baseUrl, parent, templateRequireContext, resourceName, injectAt },
                list);

        if (create !== null)
            this.create = createRouteFactory(
                { name, routeDefinition, baseUrl, parent: detailParentRoute, templateRequireContext, resourceName, injectAt },
                create);

        if (view !== null)
            this.view = viewRouteFactory(
                { name, routeDefinition, baseUrl, parent: detailParentRoute, templateRequireContext, resourceName, injectAt },
                view);

        if (edit !== null)
            this.edit = editRouteFactory(
                { name, routeDefinition, baseUrl, parent: editParentRoute, templateRequireContext, resourceName, injectAt },
                edit);
    }
}


function listRouteFactory({
        name,
        routeDefinition,
        baseUrl,
        parent,
        templateRequireContext,
        resourceName,
        injectAt,
    },
    {
        template = templateRequireContext('./list.html'),
        url = baseUrl,
        controller = GenericListController,
        controllerAs = 'listCtrl',
        resolve = {},
        data = {},
        views = {},
    }) {
        if (! resolve.records ) {
            resolve.records = function resolveRecords($stateParams, Restangular, $state) {
                // TODO need a way to add as parameter parent this.routes PKs?
                return this.getResource(Restangular, $stateParams).all(resourceName).getList();
            }
            resolve.records.$inject = ['$stateParams', 'Restangular', '$state'];
        }

        function getResource(Restangular, $stateParams) {
            if (parent && resourceName[0] != '/' && this.parent.getResource)
                return this.parent.getResource(Restangular, $stateParams);

            return Restangular;
        }


        views[`list@${injectAt}`] =  {
            controller,
            controllerAs,
            template,
            resolve,
        };

        data.routeDefinition = routeDefinition;

        return {
            parent,
            name: routeDefinition.list,
            url,
            views,
            data,
            resolve,
            getResource,
        };
}


function createRouteFactory({
        name,
        routeDefinition,
        baseUrl,
        parent,
        templateRequireContext,
        resourceName,
        injectAt,
    },
    {
        createTemplate = tryLoadTemplate(templateRequireContext, `./create.html`),
        template =  createTemplate || templateRequireContext(`./edit.html`),
        url = routeDefinition.list ? '/create' : `${baseUrl}/create`,
        controller = GenericDetailController,
        controllerAs = createTemplate ? 'createCtrl' : 'editCtrl',
        resolve = {},
        data = {},
        views = {},
    }) {
        // Inject the resource into the controller to be able to catch it in its closure.
        if (! resolve.resource ) {
            resolve.resource = function resolveRecords($stateParams, Restangular) {
                // TODO need a way to add as parameter parent routes PKs?
                return this.getResource(Restangular, $stateParams).all(resourceName);
            }
            resolve.resource.$inject = ['$stateParams', 'Restangular'];
        }

         function getResource(Restangular, $stateParams) {
            if (parent && resourceName[0] != '/' && this.parent.getResource)
                return this.parent.getResource(Restangular, $stateParams);

            return Restangular;
        }

        views[`detail@${injectAt}`] =  {
            controller,
            controllerAs,
            template,
        };

        data.routeDefinition = routeDefinition;

        return {
            parent,
            name: routeDefinition.create,
            url,
            views,
            data,
            resolve,
            getResource,
        };
}


function viewRouteFactory({
        name,
        routeDefinition,
        baseUrl,
        parent,
        templateRequireContext,
        resourceName,
        injectAt,
    },
    {
        template = templateRequireContext(`./view.html`),
        url = (routeDefinition.list ? '' : baseUrl) + `/{${ routeDefinition.stateParamKey }:${ routeDefinition.stateParamPattern }}`,
        controller = GenericDetailController,
        controllerAs = 'viewCtrl',
        resolve = {},
        data = {},
        views = {},
    }) {
        if (! resolve.record ) {
            resolve.record = function resolveRecords($stateParams, Restangular, $state) {
                // TODO need a way to add as parameter parent routes PKs?
                return this.getResource(Restangular, $stateParams).get();
            }
            resolve.record.$inject = ['$stateParams', 'Restangular', '$state'];
        }

        function getResource(Restangular, $stateParams) {
            let parentResource = Restangular;
            if (parent && resourceName[0] != '/' && this.parent.getResource)
                parentResource = this.parent.getResource(Restangular, $stateParams);

            return parentResource.one(resourceName, $stateParams[routeDefinition.stateParamKey]);
        }

        views[`detail@${injectAt}`] = {
            controller,
            controllerAs,
            template,
        };

        data.routeDefinition = routeDefinition;

        return {
            parent,
            name: routeDefinition.view,
            url,
            views,
            data,
            resolve,
            getResource,
        };
}


function editRouteFactory({
        name,
        routeDefinition,
        baseUrl,
        parent,
        templateRequireContext,
        resourceName,
        injectAt,
    },
    {
        template = templateRequireContext(`./edit.html`),
        url = routeDefinition.view ? '/edit' : `/${baseUrl}/{${ routeDefinition.stateParamKey }:${ routeDefinition.stateParamPattern }}/edit`,
        controller = GenericDetailController,
        controllerAs = 'editCtrl',
        resolve = {},
        data = {},
        views = {},
    }) {

        // Resolve from parent route
        // TODO if there is no view route we need to resolve directly.
        resolve.record =  ['record', (record) => record ];

        views[`detail@${injectAt}`] = {
            controller,
            controllerAs,
            template,
        };

        data.routeDefinition = routeDefinition;

        return {
            parent,
            name: routeDefinition.edit,
            url,
            views,
            data,
            resolve,
        };
}


export default RouteSet;
