import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {MagicItem} from 'charactersheet/models/common';

import template from './form.html';

export class MagicItemFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new MagicItem());

    notify = () => {
        Notifications.magicItem.changed.dispatch();
    }

    magicItemsPrePopFilter = (request, response) => {
        var term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            var keys = DataRepository.magicItems
                ? Object.keys(DataRepository.magicItems)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateMagicItems = (label, value) => {
        var magicItems = DataRepository.magicItems[label];
        this.currentEditItem().importValues(magicItems);
        this.shouldShowDisclaimer(true);
    };

    setMagicItemType = (label, value) => {
        this.currentEditItem().magicItemType(value);
    };

    setMagicItemRarity = (label, value) => {
        this.currentEditItem().magicItemRarity(value);
    };
}

ko.components.register('magic-item-form', {
    viewModel: MagicItemFormComponentViewModel,
    template: template
});
