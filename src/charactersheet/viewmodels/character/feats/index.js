import 'bin/knockout-bootstrap-modal';
import {
    Feat,
    Tracked
} from 'charactersheet/models/character';
import {
    Fixtures,
    Notifications
} from 'charactersheet/utilities';
import { CharacterManager } from 'charactersheet/utilities';
import { DataRepository } from 'charactersheet/utilities';
import { FeatFormComponentViewModel } from './form';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SortService } from 'charactersheet/services/common';
import { Utility } from 'charactersheet/utilities';
import ko from 'knockout';
import template from './index.html';
import uuid from 'node-uuid';

export function FeatsViewModel(params) {
    var self = this;
    self.tabId = params.tabId;

    self.DESCRIPTION_MAX_LENGTH = 45;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'}
    };

    self.feats = ko.observableArray([]);
    self.sort = ko.observable(self.sorts['name asc']);
    self.filter = ko.observable('');
    self.showAddForm = ko.observable(false);

    self.toggleAddForm = () => {
        if (self.showAddForm()) {
            self.showAddForm(false);
            $('#add-feat').collapse('hide');
        } else {
            self.showAddForm(true);
            $('#add-feat').collapse('show');
        }
    };

    self.collapseAll = () => {
        $('#feat-pane .collapse.in').collapse('hide');
    };

    self.load = function() {
        Notifications.global.save.add(self.save);

        var key = CharacterManager.activeCharacter().key();
        self.feats(PersistenceService.findBy(Feat, 'characterId', key));
    };

    self.unload = function() {
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.feats().forEach(function(e, i, _) {
            e.save();
        });
    };


    self.filteredAndSortedFeats = ko.computed(function() {
        return SortService.sortAndFilter(self.feats(), self.sort(), null);
    });

    self.sortArrow = function(columnName) {
        return SortService.sortArrow(columnName, self.sort());
    };

    self.sortBy = function(columnName) {
        self.sort(SortService.sortForName(self.sort(),
            columnName, self.sorts));
    };

    self.addFeat = (feat) => {
        feat.save();
        self.feats.push(feat);
    };

    self.clear = function() {
        self.feats([]);
    };

    self.removeFeat = function(feat) {
        if (feat.isTracked()) {
            var tracked = PersistenceService.findFirstBy(
                Tracked, 'trackedId', feat.trackedId());
            tracked.delete();
        }
        self.feats.remove(feat);
        feat.delete();
        Notifications.feat.changed.dispatch();
    };

    self.trackedPopoverText = function() {
        return 'Tracked Feats are listed in Feature Tracker.';
    };
}

ko.components.register('feats', {
    viewModel: FeatsViewModel,
    template: template
});
