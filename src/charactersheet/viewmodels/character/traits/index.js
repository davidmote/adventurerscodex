import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    DataRepository,
    Fixtures,
    Notifications,
    Utility } from 'charactersheet/utilities';
import { PersistenceService,
    SortService } from 'charactersheet/services/common';
import { Tracked,
    Trait } from 'charactersheet/models';

import { TraitFormComponentViewModel } from './form';
import ko from 'knockout';
import template from './index.html';

export function TraitsViewModel() {
    var self = this;

    self.DESCRIPTION_MAX_LENGTH = 45;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'},
        'race asc': { field: 'race', direction: 'asc'},
        'race desc': { field: 'race', direction: 'desc'}
    };

    self.traits = ko.observableArray([]);
    self.sort = ko.observable(self.sorts['name asc']);
    self.filter = ko.observable('');


    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-trait').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-trait').collapse('show');
        }
    };

    self.collapseAll = () => {
        $('#trait-panel .collapse.in').collapse('hide');
    };

    self.shortName = function(string) {
        return Utility.string.truncateStringAtLength(string(), 25);
    };

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.traits(PersistenceService.findBy(Trait, 'characterId', key));
    };

    self.unload = function() {
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.traits().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.filteredAndSortedTraits = ko.computed(function() {
        return SortService.sortAndFilter(self.traits(), self.sort(), null);
    });

    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    self.addTrait = function() {
        trait.save();
        self.traits.push(trait);
    };

    self.clear = function() {
        self.traits([]);
    };

    self.removeTrait = function(trait) {
        if (trait.isTracked()) {
            var tracked = PersistenceService.findFirstBy(
                Tracked, 'trackedId', trait.trackedId());
            tracked.delete();
        }
        self.traits.remove(trait);
        trait.delete();
        Notifications.trait.changed.dispatch();
    };
}

ko.components.register('traits', {
    viewModel: TraitsViewModel,
    template: template
});
