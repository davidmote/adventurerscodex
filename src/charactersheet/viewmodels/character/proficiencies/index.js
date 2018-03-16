import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Utility
} from 'charactersheet/utilities';
import { DataRepository } from 'charactersheet/utilities';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { Proficiency } from 'charactersheet/models/character';
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
    self.blankProficiency = ko.observable(new Proficiency());

    self.sort = ko.observable(self.sorts['name asc']);
    self.filter = ko.observable('');
    self.shouldShowDisclaimer = ko.observable(false);
    self.elementHasFocus = ko.observable(false);

        // Wait for page load
    self.load = function() {
        Notifications.global.save.add(self.save);
        var key = CharacterManager.activeCharacter().key();
        self.proficiencies(PersistenceService.findBy(Proficiency, 'characterId', key));

        $('#add-proficiency').on('shown.bs.collapse', ()=>{
            self.elementHasFocus(true);
        });
        $('#add-proficiency').on('hidden.bs.collapse', ()=>{
            self.elementHasFocus(false);
        });
    };

    self.generateBlank = () => (new Proficiency());

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
    // Pre-pop methods
    self.proficienciesPrePopFilter = function(request, response) {
        var term = request.term.toLowerCase();
        var keys = DataRepository.proficiencies ? Object.keys(DataRepository.proficiencies) : [];
        var results = keys.filter(function(name, idx, _) {
            return name.toLowerCase().indexOf(term) > -1;
        });
        response(results);
    };

    self.populateProficiency = function(label, value) {
        var proficiency = DataRepository.proficiencies[label];
        self.blankProficiency().importValues(proficiency);
        self.shouldShowDisclaimer(true);
    };

    self.setType = function(label, value) {
        self.blankProficiency().type(value);
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

    self.addProficiency = function() {
        var proficiency = self.blankProficiency();
        proficiency.characterId(CharacterManager.activeCharacter().key());
        proficiency.save();
        self.proficiencies.push(proficiency);
        self.blankProficiency(new Proficiency());
        self.shouldShowDisclaimer(false);
        self.elementHasFocus(false);
    };


    self.cancelAddProficiency = () => {
        self.shouldShowDisclaimer(false);
        self.blankProficiency(new Proficiency());
    };

    self.clear = function() {
        self.proficiencies([]);
    };

    self.removeProficiency = function(proficiency) {
        self.proficiencies.remove(proficiency);
        proficiency.delete();
        Notifications.proficiency.changed.dispatch();
    };

    self.editProficiency = function(proficiency) {
        self.editItemIndex = proficiency.__id;
        self.currentEditItem(new Proficiency());
        self.currentEditItem().importValues(proficiency.exportValues());
        self.modalOpen(true);
    };
}

ko.components.register('proficiencies', {
    viewModel: ProficienciesViewModel,
    template: template
});
