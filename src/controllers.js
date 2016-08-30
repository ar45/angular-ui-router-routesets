
class GenericListController {
    constructor($scope, $location, $stateParams, $state, records) {
        this.$location = $location;
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.records = records;
        this.itemsPerPage = this.getItemsPerPage();

        $scope.$watch( () => this.itemsPerPage, (newValue, oldValue) => {
            if (oldValue != newValue) {
                this.$location.search('page_size', newValue);
            }
        });
    }

    getItemsPerPage() {
        return +(this.$location.search().page_size) || 5;
    }

    hasPreviousPage() {
        return this.records.previous != null;
    }

    hasNextPage() {
        return this.records.next != null;
    }

    nextPage() {
        let page = (+this.$stateParams.page || 1) + 1;
        return `${this.$state.$current.name}({ page: ${page} })`;
    }

    previousPage() {
        let page = this.$stateParams.page - 1;
        return `${this.$state.$current.name}({ page: ${page} })`;
    }
}

GenericListController.prototype.itemsPerPageOptions = [5, 10, 25, 50, 75, 100];

GenericListController.$inject = ['$scope', '$location', '$stateParams', '$state', 'records'];



class GenericDetailController {
    constructor($stateParams, $state, record) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.record = record;
        window.$state = $state;
    }

    get exists() {
        return !!this.record.id;
    }

    get save() {
        return this.exists ? this.update : this.create;
    }

    get detailRoute() {
        return this.$state.current.data.routeDefinition.view;
    }

    create() {
        return this.resource.post(this.record).then( record => this.redirect(this.redirectTo) );
    }

    update({ fields, excludedFields }) {
        let clonedRecord = angular.copy(this.record);
        // TODO filter Out fields from the update
        return clonedRecord.patch().then( record => this.redirect(this.redirectTo) );
    }

    redirect(to = this.detailRoute) {
        this.$state.go(to, this.$stateParams);
    }
}

GenericDetailController.$inject = ['$stateParams', '$state', 'record'];


export { GenericListController, GenericDetailController };
