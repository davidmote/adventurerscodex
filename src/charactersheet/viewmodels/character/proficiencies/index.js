import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Utility
} from 'charactersheet/utilities';

import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { Proficiency } from 'charactersheet/models/character';
import { ProficiencyFormComponentViewModel } from './form';
import { SortService } from 'charactersheet/services/common';
import ko from 'knockout';
import template from './index.html';

export function ProficienciesViewModel() {
    var self = this;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'},
        'type asc': { field: 'type', direction: 'asc'},
        'type desc': { field: 'type', direction: 'desc'}
    };

    self.proficiencies = ko.observableArray([]);

    self.sort = ko.observable(self.sorts['name asc']);

    self.filter = ko.observable('');

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-proficiency').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-proficiency').collapse('show');
        }
    };
        // Wait for page load
    self.load = function() {
        Notifications.global.save.add(self.save);
        var key = CharacterManager.activeCharacter().key();
        self.proficiencies(PersistenceService.findBy(Proficiency, 'characterId', key));
    };

    self.unload = function() {
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.proficiencies().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.update = () => {
        Notifications.proficiency.changed.dispatch();
    };

    self.filteredAndSortedProficiencies = ko.computed(function() {
        return SortService.sortAndFilter(self.proficiencies(), self.sort(), null);
    });

    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    self.addProficiency = function(proficiency) {
        proficiency.characterId(CharacterManager.activeCharacter().key());
        proficiency.save();
        self.proficiencies.push(proficiency);
    };

    self.clear = function() {
        self.proficiencies([]);
    };

    self.removeProficiency = function(proficiency) {
        self.proficiencies.remove(proficiency);
        proficiency.delete();
        Notifications.proficiency.changed.dispatch();
    };

}

ko.components.register('proficiencies', {
    viewModel: ProficienciesViewModel,
    template: template
});
