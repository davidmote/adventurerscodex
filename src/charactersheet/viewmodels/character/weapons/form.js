import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Weapon} from 'charactersheet/models/common';

import template from './form.html';

export class WeaponFormComponentViewModel extends FormComponentViewModel {

    generateBlank = () => (new Weapon());

    notify = () => {
        Notifications.weapon.changed.dispatch();
    }

    weaponsPrePopFilter = (request, response) => {
        var term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            var keys = DataRepository.weapons
                ? Object.keys(DataRepository.weapons)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateWeapon = (label, value) => {
        var weapon = DataRepository.weapons[label];

        this.currentEditItem().importValues(weapon);
        this.shouldShowDisclaimer(true);
    };

    setWeaponType = (label, value) => {
        this.currentEditItem().weaponType(value);
    };

    setWeaponHandedness = (label, value) => {
        this.currentEditItem().weaponHandedness(value);
    };

    setWeaponProficiency = (label, value) => {
        this.currentEditItem().weaponProficiency(value);
    };

    setWeaponCurrencyDenomination = (label, value) => {
        this.currentEditItem().weaponCurrencyDenomination(value);
    };

    setWeaponDamageType = (label, value) => {
        this.currentEditItem().weaponDamageType(value);
    };

    setWeaponProperty = (label, value) => {
        this.currentEditItem().weaponProperty(value);
    };
}

ko.components.register('weapon-form', {
    viewModel: WeaponFormComponentViewModel,
    template: template
});
