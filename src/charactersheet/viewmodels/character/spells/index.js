import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    DataRepository,
    Notifications,
    Utility
} from 'charactersheet/utilities';
import {
    PersistenceService,
    SortService
} from 'charactersheet/services/common';
import { Spell } from 'charactersheet/models';
import { SpellFormComponentViewModel } from './form';
import { debounce } from 'lodash';
import ko from 'knockout';
import template from './index.html';

export function SpellbookViewModel(params) {
    var self = this;
    self.tabId = params.tabId;

    self.sorts = {
        'spellName asc': { field: 'spellName', direction: 'asc'},
        'spellName desc': { field: 'spellName', direction: 'desc'},
        'spellTypeLabel asc': { field: 'spellTypeLabel', direction: 'asc'},
        'spellTypeLabel desc': { field: 'spellTypeLabel', direction: 'desc'},
        'spellDmg asc': { field: 'spellDmg', direction: 'asc'},
        'spellDmg desc': { field: 'spellDmg', direction: 'desc'},
        'spellLevel asc': { field: 'spellLevel', direction: 'asc', numeric: true},
        'spellLevel desc': { field: 'spellLevel', direction: 'desc', numeric: true},
        'spellCastingTime asc': { field: 'spellCastingTime', direction: 'asc'},
        'spellCastingTime desc': { field: 'spellCastingTime', direction: 'desc'},
        'spellRange asc': { field: 'spellRange', direction: 'asc'},
        'spellRange desc': { field: 'spellRange', direction: 'desc'}
    };

    self._dummy = ko.observable();
    self.blankSpell = ko.observable(new Spell());
    self.spellbook = ko.observableArray([]);
    self.modalOpen = ko.observable(false);
    self.editItemIndex = null;
    self.currentEditItem = ko.observable();
    self.shouldShowDisclaimer = ko.observable(false);
    self.previewTabStatus = ko.observable('active');
    self.editTabStatus = ko.observable('');
    self.firstModalElementHasFocus = ko.observable(false);
    self.editFirstModalElementHasFocus = ko.observable(false);
    self.spellSchoolIconCSS = ko.observable('');
    self.editMode = ko.observable(false);
    self.elementHeight = ko.observable('auto');


    self.filter = ko.observable('');

    self.filteredByCastable = ko.observable(false);

    self.sort = ko.observable(self.sorts['spellLevel asc']);

    self.numberOfPrepared = ko.computed(function(){
        var prepared = 0;
        self.spellbook().forEach(function(spell) {
            if (spell.spellPrepared() === true) {
                prepared++;
            }
        });
        return prepared;
    });

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            $('#add-spell').collapse('hide');
            self.showAddForm(false);
        } else {
            self.showAddForm(true);
            $('#add-spell').collapse('show');
        }
    };

    self.collapseAll = () => {
        $('#spells-pane .collapse.in').collapse('hide');
    };

    self.memorizeSpell = (data, event) => {
        event.stopPropagation();
        if(!(data.spellLevel() == 0  || data.spellAlwaysPrepared())) {
            data.spellPrepared(!data.spellPrepared());
        }
    };

    self.numberOfSpells = ko.computed(function() {
        return self.spellbook() ? self.spellbook().length : 0;
    });

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.spellbook(PersistenceService.findBy(Spell, 'characterId', key));
        self.spellbook().forEach(function(spell, idx, _) {
            spell.spellPrepared.subscribe(self.save);
        });
        Notifications.spellStats.changed.add(self.valueHasChanged);
    };

    self.save = function() {
        self.spellbook().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.determineSpellSchoolIcon = ko.computed(function() {
        if (self.currentEditItem() && self.currentEditItem().spellSchool()) {
            var spellSchool = self.currentEditItem().spellSchool();
            self.spellSchoolIconCSS(spellSchool.toLowerCase());
        }
    });

    self.trunc = function(string, len=20) {
        return Utility.string.truncateStringAtLength(string(), len);
    };

    /**
     * Filters and sorts the spells for presentation in a table.
     * Boolean sort logic inspired by:
     * http://stackoverflow.com/
     * questions/17387435/javascript-sort-array-of-objects-by-a-boolean-property
     */
    self.filteredAndSortedSpells = ko.computed(function() {
        let spellbook = self.spellbook();
        if (self.filteredByCastable()) {
            spellbook = self.spellbook().filter(function(spell) {
                return spell.spellIsCastable();
            }, self);
        }
        return SortService.sortAndFilter(spellbook, self.sort(), null);
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

    //Manipulating spells
    self.addSpell = (spell) => {
        spell.characterId(CharacterManager.activeCharacter().key());
        spell.save();
        spell.spellPrepared.subscribe(self.save);
        self.spellbook.push(spell);
    };

    self.removeSpell = function(spell) {
        self.spellbook.remove(spell);
        spell.delete();
    };

    self.clear = function() {
        self.spellbook([]);
    };

    self.valueHasChanged = function() {
        self.spellbook().forEach(function(e, i, _) {
            e.updateValues();
        });
    };
}

ko.components.register('spells', {
    viewModel: SpellbookViewModel,
    template: template
});
