import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Item} from 'charactersheet/models/common';

import template from './form.html';

export class ItemFormComponentViewModel {
    constructor(params) {
        this.data = params.data;
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.addCallback = params.add;
        this.removeCallback = params.remove;

        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable();
        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);
        this.shouldShowDisclaimer = ko.observable(false);
    }

    load = () => {
        this.currentEditItem(new Item());
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Item());
                    this.currentEditItem().importValues(this.data.exportValues());
                }
                this.formElementHasFocus(true);
            } else {
                this.formElementHasFocus(false);
                if (this.bypassUpdate()) {
                    this.bypassUpdate(false);
                } else {
                    this.update();
                }
                this.currentEditItem(new Item());
            }
        });
    }

    update = () => {
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.data.save();
        } else {
            this.addCallback(this.currentEditItem())
        }
        Notifications.item.changed.dispatch();
    }

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Item());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Item());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            Notifications.item.changed.dispatch()
        }, 650);
    }

    // Prepopulate methods
    setItemCurrencyDenomination = (label, value) => {
        this.currentEditItem().itemCurrencyDenomination(value);
    };

    itemsPrePopFilter = (request, response) => {
        var term = request.term.toLowerCase();
        let results = [];
        // if (term && term.length > 2) {
            const keys = DataRepository.items
                ? Object.keys(DataRepository.items)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        // }
        response(results);
    };

    populateItem = (label, value) => {
        var item = DataRepository.items[label];
        this.currentEditItem().importValues(item);
        this.shouldShowDisclaimer(true);
    };
}

ko.components.register('item-form', {
    viewModel: ItemFormComponentViewModel,
    template: template
});
