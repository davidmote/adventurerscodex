import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Fixtures,
    Notifications,
    Utility } from 'charactersheet/utilities';
import {
    Feat,
    Feature,
    Tracked,
    Trait
} from 'charactersheet/models/character';
import {
    PersistenceService,
    SortService
} from 'charactersheet/services/common';
import campingTent from 'images/camping-tent-blue.svg';
import campingTentWhite from 'images/camping-tent.svg';
import ko from 'knockout';
import meditation from 'images/meditation-blue.svg';
import meditationWhite from 'images/meditation.svg';
import template from './index.html';

export function TrackerViewModel() {
    var self = this;

    self.sorts = {
        'name asc': { field: 'name', direction: 'asc'},
        'name desc': { field: 'name', direction: 'desc'}
    };

    self.trackables = ko.observableArray([]);
    self.editItem = ko.observable();
    self.modalOpen = ko.observable(false);
    self.editModalTitle = ko.observable('');
    self.sort = ko.observable(self.sorts['name asc']);
    self.filter = ko.observable('');
    self.meditation = meditation;
    self.campingTent = campingTent;
    self.meditationWhite = meditationWhite;
    self.campingTentWhite = campingTentWhite;
    // List of all models that can be tracked
    self.trackedTypes = [ Feat, Trait, Feature ];

    self.nameMeta = (tracked) => {
        let metaText = '';
        if (tracked.characterClass) {
            metaText = `${tracked.characterClass()}`;
        }
        if (tracked.level) {
            metaText += ` (Lvl ${tracked.level()})`;
        }
        if (tracked.race) {
            metaText = `${tracked.race()}`;
        }
        return metaText;
    };

    self.consoleIt =(it)=>{
        console.log(it);
    };
    self.generateBlank = () => (new Tracked());
    // const mapToColor = (level) => {
    //     console.log(cssName);
    //     switch (cssName) {
    //     case 'progress-bar-forest':
    //         return '#2F972F';
    //     case 'progress-bar-sky':
    //         return '#71D4E8';
    //     case 'progress-bar-orange':
    //         return '#f0ad4e';
    //     case 'progress-bar-red':
    //         return '#d9534f';
    //     case 'progress-bar-purple':
    //         return '#800080';
    //     case 'progress-bar-teal':
    //         return '#01DFD7';
    //     case 'progress-bar-indigo':
    //         return '#8000FF';
    //     case 'progress-bar-brown':
    //         return '#906713';
    //     case 'progress-bar-yellow':
    //         return '#D7DF01';
    //     default:
    //         return '#777';
    //     }
    // };

    const mapToColor = (trackableColor) => {
        switch (trackableColor) {
        case 'progress-bar-red':
            return '#e74c3c'; //'#d9534f'; // red
        case 'progress-bar-orange':
            return '#e67e22'; //'#f0ad4e'; // orange
        case 'progress-bar-yellow':
            return '#f1c40f'; //'#D7DF01'; // yellow
        case 'progress-bar-forest':
            return '#1abc9c'; //'#2F972F'; // forest
        case 'progress-bar-teal':
            return '#2ecc71'; //'#01DFD7'; // teal
        case 'progress-bar-sky':
            return '#3498db'; //'#71D4E8'; // sky blue
        case 'progress-bar-indigo':
            return '#9b59b6'; //'#8000FF'; // indigo
        case 'progress-bar-purple':
            return '#34495e'; //'#800080'; // purple
        case 'progress-bar-brown':
            return '#95a5a6'; //'#906713'; //brown
        default:
            return '#777';
        }
    };
    self.mapToChart = (trackable) => ({
        data: {
            value: parseInt(trackable.maxUses()) - parseInt(trackable.used()),
            maxValue: trackable.maxUses()
        },
        config: {
            strokeWidth: 2,
            trailWidth: 1,
            from: {
                color: mapToColor(trackable.color())
            },
            to: {
                color: mapToColor(trackable.color())
            }

        }
    });

    self.needsResetsOnImg = function(trackable){
        return trackable.resetsOn() != '';
    };

    self.resetsOnImgSource = function(trackable){
        if(trackable.resetsOn() === 'long') {
            return campingTent;
        } else if (trackable.resetsOn() === 'short') {
            return meditation;
        } else {
            throw 'Unexpected feature resets on string.';
        }
    };

    self.collapseAll = () => {
        $('.collapse.in').collapse('hide');
    };

    self.load = function() {
        Notifications.global.save.add(self.save);
        self.loadTrackedItems();

        self.trackables().forEach(function(tracked, idx, _) {
            tracked.tracked().maxUses.subscribe(self.dataHasChanged);
            tracked.tracked().used.subscribe(self.dataHasChanged);
        });

        //Notifications
        Notifications.events.shortRest.add(self.resetShortRestFeatures);
        Notifications.events.longRest.add(self.resetLongRestFeatures);
        Notifications.feat.changed.add(self.loadTrackedItems);
        Notifications.trait.changed.add(self.loadTrackedItems);
        Notifications.feature.changed.add(self.loadTrackedItems);
    };

    self.loadTrackedItems = function() {
        var key = CharacterManager.activeCharacter().key();
        var trackables = [];
        // Fetch all items that can be tracked
        self.trackedTypes.forEach(function(type, idx, _){
            var result = PersistenceService.findBy(type, 'characterId', key);
            trackables = trackables.concat(result);
        });
        var tracked = trackables.filter(function(e, i, _) {
            if (e.isTracked()) {
                e.tracked(PersistenceService.findFirstBy(Tracked, 'trackedId', e.trackedId()));
            }
            return e.isTracked();
        });
        self.trackables(tracked);
        self.trackables().forEach(function(tracked, idx, _) {
            tracked.tracked().maxUses.subscribe(self.dataHasChanged);
            tracked.tracked().used.subscribe(self.dataHasChanged);
        });
    };

    self.unload = function() {
        self.save();
        Notifications.global.save.remove(self.save);
        Notifications.events.longRest.remove(self.resetShortRestFeatures);
        Notifications.events.shortRest.remove(self.resetShortRestFeatures);
        Notifications.feat.changed.remove(self.loadTrackedItems);
        Notifications.trait.changed.remove(self.loadTrackedItems);
        Notifications.feature.changed.remove(self.loadTrackedItems);
    };

    self.save = function() {
        self.trackables().forEach(function(item, idx, _){
            item.tracked().save();
        });
    };

    /* UI Methods */

    self.trackedElementProgressWidth = function(max, used) {
        return (parseInt(max) - parseInt(used)) / parseInt(max);
    };

    self.shortName = function(string) {
        return Utility.string.truncateStringAtLength(string(), 30);
    };

    /**
     * Filters and sorts the trackables for presentation in a table.
     */
    self.filteredAndSortedTrackables = ko.computed(function() {
        return SortService.sortAndFilter(self.trackables(), self.sort(), null);
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

    //Manipulating tracked elements

    self.resetShortRestFeatures = function() {
        ko.utils.arrayForEach(self.trackables(), function(item) {
            if (item.tracked().resetsOn() === Fixtures.resting.shortRestEnum) {
                item.tracked().used(0);
            }
        });
    };

    self.resetLongRestFeatures = function() {
        ko.utils.arrayForEach(self.trackables(), function(item) {
            item.tracked().used(0);
        });
    };

    self.maxTrackerWidth = function() {
        return 100 / self.trackables().length;
    };

    // Modal Methods

    self.modifierHasFocus = ko.observable(false);
    self.editHasFocus = ko.observable(false);

    self.modalFinishedAnimating = function() {
        self.modifierHasFocus(true);
    };

    self.modalFinishedClosing = function() {
        if (self.modalOpen()) {
            var tracked = PersistenceService.findFirstBy(Tracked, 'trackedId',
                self.editItem().trackedId());
            tracked.importValues(self.editItem().exportValues());
            tracked.save();
            self.trackables().forEach(function(item, idx, _) {
                if (item.trackedId() === tracked.trackedId()) {
                    item.tracked().importValues(tracked.exportValues());
                }
            });
        }
        self.dataHasChanged();
        self.modalOpen(false);
    };

    self.dataHasChanged = function() {
        self.save();
        Notifications.tracked.changed.dispatch();
    };

    self.editModalOpen = function() {
        self.editHasFocus(true);
    };

    self.editTracked = function(item) {
        self.editModalTitle(item.name());
        self.editItem(new Tracked());
        self.editItem().importValues(item.tracked().exportValues());
        self.modalOpen(true);
    };

    self.refreshTracked = function(item) {
        item.tracked().used(0);
    };

    self.clear = function() {
        self.trackables([]);
    };
}

ko.components.register('tracker', {
    viewModel: TrackerViewModel,
    template: template
});
