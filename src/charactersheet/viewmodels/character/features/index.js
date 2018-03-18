import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Fixtures,
    Notifications
} from 'charactersheet/utilities';
import {
    Feature,
    Tracked
} from 'charactersheet/models';
import {
    PersistenceService,
    SortService
} from 'charactersheet/services/common';
import { FeatureFormComponentViewModel } from './form';
import { Utility } from 'charactersheet/utilities';
import ko from 'knockout';
import template from './index.html';

export function FeaturesViewModel() {
    var self = this;

    self.DESCRIPTION_MAX_LENGTH = 45;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'},
        'characterClass asc': { field: 'characterClass', direction: 'asc'},
        'characterClass desc': { field: 'characterClass', direction: 'desc'}
    };

    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-feature').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-feature').collapse('show');
        }
    };

    self.features = ko.observableArray([]);
    self.sort = ko.observable(self.sorts['name asc']);
    self.filter = ko.observable('');

    //Static Data
    self.classOptions = Fixtures.profile.classOptions;

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.features(PersistenceService.findBy(Feature, 'characterId', key));
    };

    self.unload = function() {
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.features().forEach(function(e, i, _) {
            e.save();
        });
    };

    self.filteredAndSortedFeatures = ko.computed(function() {
        return SortService.sortAndFilter(self.features(), self.sort(), null);
    });

    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    self.addFeature = function(feature) {
        feature.save();
        self.features.push(feature);
    };

    self.clear = function() {
        self.features([]);
    };

    self.removeFeature = function(feature) {
        if (feature.isTracked()) {
            var tracked = PersistenceService.findFirstBy(
                Tracked, 'trackedId', feature.trackedId());
            tracked.delete();
        }
        self.features.remove(feature);
        feature.delete();
        Notifications.feature.changed.dispatch();
    };

    self.trackedPopoverText = function() {
        return 'Tracked Features are listed in the Tracker.';
    };
}

ko.components.register('features', {
    viewModel: FeaturesViewModel,
    template: template
});
