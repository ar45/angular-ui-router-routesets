
class GenericListController {
    constructor($stateParams, $state, records) {
        this.$stateParams = $stateParams;
        this.$state = $state;
        this.records = records;
    }
}

GenericListController.$inject = ['$stateParams', '$state', 'records'];


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
