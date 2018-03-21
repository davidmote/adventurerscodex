import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Armor} from 'charactersheet/models/common';

import template from './form.html';

export class ArmorFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new Armor());

    notify = () => {
        Notifications.armor.changed.dispatch();
    }

    setArmorType = (label, value) => {
        this.currentEditItem().armorType(value);
    };

    setArmorCurrencyDenomination = (label, value) => {
        this.currentEditItem().armorCurrencyDenomination(value);
    };

    setArmorStealth = (label, value) => {
        this.currentEditItem().armorStealth(value);
    };

    /* Modal Methods */
    armorsPrePopFilter = (request, response) => {
        const term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            var keys = DataRepository.armors
                ? Object.keys(DataRepository.armors)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateArmor = (label, value) => {
        const armor = DataRepository.armors[label];
        this.currentEditItem().importValues(armor);
        this.shouldShowDisclaimer(true);
    };
}

ko.components.register('armor-form', {
    viewModel: ArmorFormComponentViewModel,
    template: template
});
