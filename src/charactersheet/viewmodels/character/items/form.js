import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import { FormComponentViewModel } from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Item} from 'charactersheet/models/common';

import template from './form.html';

export class ItemFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new Item());

    notify = () => {
      Notifications.item.changed.dispatch();
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
