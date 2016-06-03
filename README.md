### Generic routing

Provides a easy common way to get a set of views in a restful manner.

## Create a route

Custom controllers inherit from our generic controllers.

Example route.

```js
import RouteSet from 'angular-ui-router-routesets/routesets'

RouteSet({
    parent,   // string
    name,     // string
    url,      // string
    resource, // string or function
    controller, // Use a one off controller for all routes.
    list: {   // custom options for list
        controller,
        data,
        resolve,
    },
    create: { // custom options for create
        controller,
        data,
        resolve,
    },
    view: {  // custom options for view
        controller,
        data,
        resolve,
    },
    edit: {  // custom options for edit
        controller,
        data,
        resolve,
    }
})
```

If `url` is a function it will be called (with the route as its context) to get the rousource.

We need the restful resource to be called for a get
