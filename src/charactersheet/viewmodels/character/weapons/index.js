import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    DataRepository,
    Fixtures,
    Notifications,
    Utility } from 'charactersheet/utilities';
import {
    PersistenceService,
    SortService } from 'charactersheet/services/common';
import { Weapon } from 'charactersheet/models/common';
import { WeaponFormComponentViewModel } from './form';
import ko from 'knockout';
import template from './index.html';

export function WeaponsViewModel(params) {
    var self = this;
    self.tabId = params.tabId;

    self.weapons = ko.observableArray([]);
    self.currencyDenominationList = ko.observableArray(Fixtures.general.currencyDenominationList);

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-weapon').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-weapon').collapse('show');
        }
    };

    self.collapseAll = () => {
        $('#weapon-pane .collapse.in').collapse('hide');
    };

    self.sorts = {
        'weaponName asc': { field: 'weaponName', direction: 'asc'},
        'weaponName desc': { field: 'weaponName', direction: 'desc'},
        'totalBonus asc': { field: 'totalBonus', direction: 'asc', numeric: true},
        'totalBonus desc': { field: 'totalBonus', direction: 'desc', numeric: true},
        'weaponDmg asc': { field: 'weaponDmg', direction: 'asc'},
        'weaponDmg desc': { field: 'weaponDmg', direction: 'desc'},
        'weaponRange asc': { field: 'weaponRange', direction: 'asc'},
        'weaponRange desc': { field: 'weaponRange', direction: 'desc'},
        'weaponDamageType asc': { field: 'weaponDamageType', direction: 'asc'},
        'weaponDamageType desc': { field: 'weaponDamageType', direction: 'desc'},
        'weaponProperty asc': { field: 'weaponProperty', direction: 'asc'},
        'weaponProperty desc': { field: 'weaponProperty', direction: 'desc'},
        'weaponQuantity asc': { field: 'weaponQuantity', direction: 'asc'},
        'weaponQuantity desc': { field: 'weaponQuantity', direction: 'desc'}
    };

    self.filter = ko.observable('');
    self.sort = ko.observable(self.sorts['weaponName asc']);

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.weapons(PersistenceService.findBy(Weapon, 'characterId', key));

        Notifications.abilityScores.changed.add(self.valueHasChanged);
        Notifications.stats.changed.add(self.valueHasChanged);
    };

    self.unload = function() {
        self.save();

        self.weapons([]);
        Notifications.abilityScores.changed.remove(self.valueHasChanged);
        Notifications.stats.changed.remove(self.valueHasChanged);
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.weapons().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.totalWeight = ko.pureComputed(function() {
        var weight = 0;
        if (self.weapons().length > 0) {
            self.weapons().forEach(function(e, i, _) {
                weight += e.weaponWeight() ? parseInt(e.weaponWeight()) : 0;
            });
        }
        return weight + ' (lbs)';
    });

    /* UI Methods */

    /**
     * Filters and sorts the weaponss for presentation in a table.
     */
    self.filteredAndSortedWeapons = ko.computed(function() {
        return SortService.sortAndFilter(self.weapons(), self.sort(), null);
    });

    /**
     * Determines whether a column should have an up/down/no arrow for sorting.
     */
    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    /**
     * Given a column name, determine the current sort type & order.
     */
    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };


    // self.modalFinishedClosing = function() {
    //     self.previewTabStatus('active');
    //     self.editTabStatus('');
    //     if (self.modalOpen()) {
    //         Utility.array.updateElement(self.weapons(), self.currentEditItem(), self.editItemIndex);
    //     }
    //
    //     // Just in case data was changed.
    //     self.save();
    //
    //     self.modalOpen(false);
    //     Notifications.weapon.changed.dispatch();
    // };

    //Manipulating weapons
    self.addWeapon = function(weapon) {
        weapon.characterId(CharacterManager.activeCharacter().key());
        weapon.save();
        self.weapons.push(weapon);
        Notifications.weapon.changed.dispatch();
    };

    self.removeWeapon = function(weapon) {
        self.weapons.remove(weapon);
        weapon.delete();
        Notifications.weapon.changed.dispatch();
    };

    self.clear = function() {
        self.weapons([]);
        Notifications.weapon.changed.dispatch();
    };

    self.valueHasChanged = function() {
        self.weapons().forEach(function(e, i, _) {
            e.updateValues();
        });
        Notifications.weapon.changed.dispatch();
    };
}

ko.components.register('weapons', {
    viewModel: WeaponsViewModel,
    template: template
});
