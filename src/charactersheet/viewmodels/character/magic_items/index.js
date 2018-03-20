import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    DataRepository,
    Utility
} from 'charactersheet/utilities';
import { MagicItem } from 'charactersheet/models/common';
import { MagicItemFormComponentViewModel } from './form';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SortService } from 'charactersheet/services/common';
import ko from 'knockout';
import template from './index.html';

export function MagicItemsViewModel() {
    var self = this;

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-magic-item').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-magic-item').collapse('show');
        }
    };

    self.sorts = {
        'magicItemName asc': { field: 'magicItemName', direction: 'asc'},
        'magicItemName desc': { field: 'magicItemName', direction: 'desc'},
        'magicItemMaxCharges asc': { field: 'magicItemMaxCharges', direction: 'asc', numeric: true},
        'magicItemMaxCharges desc': { field: 'magicItemMaxCharges', direction: 'desc', numeric: true},
        'magicItemWeight asc': { field: 'magicItemWeight', direction: 'asc', numeric: true},
        'magicItemWeight desc': { field: 'magicItemWeight', direction: 'desc', numeric: true},
        'magicItemCharges asc': { field: 'magicItemCharges', direction: 'asc', numeric: true},
        'magicItemCharges desc': { field: 'magicItemCharges', direction: 'desc', numeric: true},
        'magicItemAttuned asc': { field: 'magicItemAttuned', direction: 'asc', booleanType: true},
        'magicItemAttuned desc': { field: 'magicItemAttuned', direction: 'desc', booleanType: true}
    };

    self.attuneItem = (data, event) => {
        event.stopPropagation();
        if (!self.noneAttuned() && data.magicItemRequiresAttunement()) {
            data.magicItemAttuned(!data.magicItemAttuned());
        }

        // if(!(data.spellLevel() == 0  || data.spellAlwaysPrepared())) {
        //     data.spellPrepared(!data.spellPrepared());
        // }
    };

    self.magicItems = ko.observableArray([]);

    self.magicItemIconCSS = ko.observable('');

    self.filter = ko.observable('');
    self.sort = ko.observable(self.sorts['magicItemName asc']);

    self.numberOfAttuned = ko.computed(function(){
        var attuned = ko.utils.arrayFilter(self.magicItems(), function(item) {
            return item.magicItemAttuned() === true;
        });
        return attuned.length;
    });

    self.noneAttuned = ko.computed(function(){
        var numberAttuned = ko.utils.arrayFilter(self.magicItems(), function(item){
            return item.magicItemRequiresAttunement() === true;
        });
        return numberAttuned.length === 0;
    });

    self.totalMagicItemWeight = ko.pureComputed(function() {
        var weightTotal = 0;
        var itemLength = self.magicItems().length;
        if (itemLength > 0) {
            for (var i = 0; i < itemLength; i++) {
                weightTotal += self.magicItems()[i].magicItemWeight() ?
                    parseFloat(self.magicItems()[i].magicItemWeight()) :
                    0;
            }
            return weightTotal + ' (lbs)';
        }
        else {
            return '0 (lbs)';
        }
    });

    // self.determineMagicItemIcon = ko.computed(function() {
    //     if (self.currentEditItem() && self.currentEditItem().magicItemType()) {
    //         var magicItemType = self.currentEditItem().magicItemType();
    //         var cssClassName = magicItemType.split(' ')[0].toLowerCase() + '-magic-item-card';
    //         self.magicItemIconCSS(cssClassName);
    //     }
    // });

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.magicItems(PersistenceService.findBy(MagicItem, 'characterId', key));

        self.magicItems().forEach(function(e, i, _) {
            e.magicItemAttuned.subscribe(self.attunedHasChanged);
        });
    };

    self.unload = function() {
        self.save();
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.magicItems().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.attunedHasChanged = function() {
        self.magicItems().forEach(function(e, i, _) {
            e.save();
        });
    };





    //
    // self.modalFinishedClosing = function() {
    //     self.previewTabStatus('active');
    //     self.editTabStatus('');
    //     self.previewTabStatus.valueHasMutated();
    //     self.editTabStatus.valueHasMutated();
    //
    //     if (self.modalOpen()) {
    //         Utility.array.updateElement(self.magicItems(), self.currentEditItem(), self.editItemIndex);
    //     }
    //
    //     // Just in case data was changed.
    //     self.save();
    //
    //     self.modalOpen(false);
    //     Notifications.magicItem.changed.dispatch();
    // };
    //

    self.filteredAndSortedMagicItems = ko.computed(function() {
        return SortService.sortAndFilter(self.magicItems(), self.sort(), null);
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

    //Manipulating magic items
    self.addItem = function(item) {
        item.characterId(CharacterManager.activeCharacter().key());
        item.save();
        self.magicItems.push(item);
        Notifications.magicItem.changed.dispatch();
    };

    self.removeItem = function(item) {
        self.magicItems.remove(item);
        item.delete();
        Notifications.magicItem.changed.dispatch();
    };

    self.clear = function() {
        self.magicItems([]);
    };
}

ko.components.register('magic-items', {
    viewModel: MagicItemsViewModel,
    template: template
});
