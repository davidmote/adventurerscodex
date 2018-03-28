import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    DataRepository,
    Fixtures,
    Notifications,
    Utility
} from 'charactersheet/utilities';
import {
    PersistenceService,
    SortService
} from 'charactersheet/services/common';
import { Armor} from 'charactersheet/models/common';
import { ArmorFormComponentViewModel } from './form';
import ko from 'knockout';
import template from './index.html';

export function ArmorViewModel() {
    var self = this;

    self.armors = ko.observableArray([]);

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-armor').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-armor').collapse('show');
        }
    };

    self.collapseAll = () => {
        $('#armor-pane .collapse.in').collapse('hide');
    };

    self.equipArmor = (data, event) => {
        event.stopPropagation();
        data.armorEquipped(!data.armorEquipped());
        self.equipArmorHandler(data);
    };

    self.equipArmorHandler = (data) => {
        if (data.armorEquipped()) {
            if (data.armorType() === 'Shield') {
                ko.utils.arrayForEach(self.armors(), function(item2) {
                    if (data.__id != item2.__id && item2.armorType() == 'Shield') {
                        item2.armorEquipped('');
                    }
                });
            } else {
                ko.utils.arrayForEach(self.armors(), function(item2) {
                    if (data.__id != item2.__id && item2.armorType() != 'Shield') {
                        item2.armorEquipped('');
                    }
                });
            }
        }
    };

    self.sorts = {
        'armorEquipped asc': { field: 'armorEquipped', direction: 'asc', booleanType: true},
        'armorEquipped desc': { field: 'armorEquipped', direction: 'desc', booleanType: true},
        'armorName asc': { field: 'armorName', direction: 'asc'},
        'armorName desc': { field: 'armorName', direction: 'desc'},
        'armorType asc': { field: 'armorType', direction: 'asc'},
        'armorType desc': { field: 'armorType', direction: 'desc'},
        'armorClass asc': { field: 'armorClass', direction: 'asc', numeric: true},
        'armorClass desc': { field: 'armorClass', direction: 'desc', numeric: true}
    };

    self.filter = ko.observable('');
    self.sort = ko.observable(self.sorts['armorName asc']);

    self.load = function() {
        Notifications.global.save.add(self.save);
        self.armors.subscribe(function() {
            Notifications.armor.changed.dispatch();
        });

        var key = CharacterManager.activeCharacter().key();
        self.armors(PersistenceService.findBy(Armor, 'characterId', key));

        //Subscriptions
        Notifications.abilityScores.changed.add(self.valueHasChanged);
    };

    self.unload = function() {
        self.save();
        Notifications.abilityScores.changed.remove(self.valueHasChanged);
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.armors().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.totalWeight = ko.pureComputed(function() {
        var weight = 0;
        if(self.armors().length > 0) {
            self.armors().forEach(function(armor, idx, _) {
                weight += armor.armorWeight() ? parseInt(armor.armorWeight()) : 0;
            });
        }
        return weight + ' (lbs)';
    });

    //
    // self.modalFinishedClosing = function() {
    //     self.previewTabStatus('active');
    //     self.editTabStatus('');
    //     if (self.modalOpen()) {
    //         Utility.array.updateElement(self.armors(), self.currentEditItem(), self.editItemIndex);
    //     }
    //
    //     self.equipArmorHandler(self.currentEditItem(), self.editItemIndex);
    //
    //     self.save();
    //     self.modalOpen(false);
    //     Notifications.armor.changed.dispatch();
    // };

    /**
     * Filters and sorts the armors for presentation in a table.
     */
    self.filteredAndSortedArmors = ko.computed(function() {
        return SortService.sortAndFilter(self.armors(), self.sort(), null);
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
        self.sort(SortService.sortForName(self.sort(), columnName, self.sorts));
    };

    //Manipulating armors
    self.addArmor = function(armor) {
        armor.characterId(CharacterManager.activeCharacter().key());
        armor.save();
        self.equipArmorHandler(armor);
        self.armors.push(armor);
    };

    self.removeArmor = function(armor) {
        armor.delete();
        self.armors.remove(armor);
    };

    self.clear = function() {
        self.armors([]);
    };

    self.valueHasChanged = function() {
        self.armors().forEach(function(e, i, _) {
            e.updateValues();
        });
    };
}

ko.components.register('armor', {
    viewModel: ArmorViewModel,
    template: template
});
