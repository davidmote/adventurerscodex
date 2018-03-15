import 'bin/knockout-bar-progress';
import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Notifications,
    Utility
} from 'charactersheet/utilities';
import {
    PersistenceService,
    SortService
} from 'charactersheet/services/common';
import { Slot } from 'charactersheet/models/character';
import campingTent from 'images/camping-tent-blue.svg';
import campingTentWhite from 'images/camping-tent.svg';
import ko from 'knockout';
import meditation from 'images/meditation-blue.svg';
import meditationWhite from 'images/meditation.svg';
import template from './index.html';

export function SpellSlotsViewModel() {
    var self = this;

    self.sorts = {
        'level asc': { field: 'level', direction: 'asc', numeric: true},
        'level desc': { field: 'level', direction: 'desc', numeric: true},
        'maxSpellSlots asc': { field: 'maxSpellSlots', direction: 'asc', numeric: true},
        'maxSpellSlots desc': { field: 'maxSpellSlots', direction: 'desc', numeric: true},
        'usedSpellSlots asc': { field: 'usedSpellSlots', direction: 'asc', numeric: true},
        'usedSpellSlots desc': { field: 'usedSpellSlots', direction: 'desc', numeric: true},
        'resetsOn asc': { field: 'resetsOn', direction: 'asc'},
        'resetsOn desc': { field: 'resetsOn', direction: 'desc'}
    };

    self.slots = ko.observableArray([]);
    self.blankSlot = ko.observable(new Slot());
    self.openModal = ko.observable(false);
    self.editHasFocus = ko.observable(false);
    self.editItemIndex = null;
    self.currentEditItem = ko.observable();
    self.modifierHasFocus = ko.observable(false);
    self.sort = ko.observable(self.sorts['level asc']);
    self.filter = ko.observable('');
    self.meditation = meditation;
    self.campingTent = campingTent;
    self.meditationWhite = meditationWhite;
    self.campingTentWhite = campingTentWhite;
    self.editMode = ko.observable(false);
    self.elementHeight = ko.observable('400px');

    const PANEL_ID = '#slot-panel';

    self.setNewHeight = function () {
        let setHeight = 0;
        if (self.editMode()) {
            setHeight = $(`${PANEL_ID} .back`).height();
        } else {
            setHeight = $(`${PANEL_ID} .front`).height();
        }
        if (setHeight > 0) {
            self.elementHeight(setHeight.toString()+'px');
        }
    };
    // Wait for page load
    setTimeout(self.setNewHeight,0);

    self.editSlots = function() {
        if (self.editMode()) {
//            Utility.array.updateElement(self.slots(), self.currentEditItem(), self.editItemIndex);
            self.save();
            self.dataHasChanged();
            self.editMode(false);
        } else {
            $('#editSpellTabs a:first').tab('show');
            self.editHasFocus(true);
            self.editMode(true);
        }
    };

    self.cancelAddSlot = function() {
        self.editMode(false);     
    };

    const mapToColor = (level) => {
        switch (level.toString()) {
        case '1':
            return '#e74c3c'; //'#d9534f'; // red
        case '2':
            return '#e67e22'; //'#f0ad4e'; // orange
        case '3':
            return '#f1c40f'; //'#D7DF01'; // yellow
        case '4':
            return '#1abc9c'; //'#2F972F'; // forest
        case '5':
            return '#2ecc71'; //'#01DFD7'; // teal
        case '6':
            return '#3498db'; //'#71D4E8'; // sky blue
        case '7':
            return '#9b59b6'; //'#8000FF'; // indigo
        case '8':
            return '#34495e'; //'#800080'; // purple
        case '9':
            return '#95a5a6'; //'#906713'; //brown

        default:
            return '#777';
        }
    };
    self.mapToChart = (slot) => ({
        data: {
            value: parseInt(slot.maxSpellSlots()) - parseInt(slot.usedSpellSlots()),
            maxValue: slot.maxSpellSlots()
        },
        config: {
            strokeWidth: 2,
            trailWidth: 1,
            from: {
                color: mapToColor(slot.level())
            },
            to: {
                color: mapToColor(slot.level())
            }

        }

    });

    self.load = function() {
        Notifications.global.save.add(self.save);
        var slots = PersistenceService.findBy(Slot, 'characterId',
            CharacterManager.activeCharacter().key());
        self.slots(slots);
        self.blankSlot().level(self.slots().length + 1);

        //Notifications
        Notifications.events.longRest.add(self.resetOnLongRest);
        Notifications.events.shortRest.add(self.resetShortRest);

        self.slots().forEach(function(slot, idx, _) {
            slot.maxSpellSlots.subscribe(self.dataHasChanged);
            slot.usedSpellSlots.subscribe(self.dataHasChanged);
        });
        self.setNewHeight();
    };

    self.unload = function() {
        self.save();
        Notifications.events.longRest.remove(self.resetOnLongRest);
        Notifications.events.shortRest.remove(self.resetShortRest);
        Notifications.global.save.remove(self.save);
    };

    self.save = function() {
        self.slots().forEach(function(e, i, _) {
            e.save();
        });
    };

    /* UI Methods */

    self.needsResetsOnImg = function(slot){
        return slot.resetsOn() != '';
    };

    self.resetsOnImgSource = function(slot){
        if(slot.resetsOn() === 'long') {
            return campingTent;
        } else if (slot.resetsOn() === 'short') {
            return meditation;
        } else {
            throw 'Unexpected feature resets on string.';
        }
    };

    /**
     * Filters and sorts the slots for presentation in a table.
     */
    self.filteredAndSortedSlots = ko.computed(function() {
        return SortService.sortAndFilter(self.slots(), self.sort(), null);
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

    //Manipulating slots

    /**
     * Resets all slots on a long-rest.
     */
    self.resetOnLongRest = function() {
        ko.utils.arrayForEach(self.slots(), function(slot) {
            slot.usedSpellSlots(0);
        });
    };

    /**
     * Resets all short-rest slot.
     */
    self.resetShortRest = function() {
        ko.utils.arrayForEach(self.slots(), function(slot) {
            if (slot.resetsOn() === Slot.REST_TYPE.SHORT_REST) {
                slot.usedSpellSlots(0);
            }
        });
    };

    // Modal Methods

    self.modalFinishedAnimating = function() {
        self.modifierHasFocus(true);
    };

    self.editModalOpen = function() {
        self.editHasFocus(true);
    };

    self.modalFinishedClosing = function() {
        if (self.openModal()) {
            Utility.array.updateElement(self.slots(), self.currentEditItem(), self.editItemIndex);
        }

        self.save();
        self.dataHasChanged();
        self.openModal(false);
    };

    //Manipulating spell slots

    self.maxAvailableSlots = function() {
        var maxSlots = 0;
        self.slots().forEach(function(e, i, _) {
            maxSlots = maxSlots + parseInt(e.maxSpellSlots());
        });
        return maxSlots;
    };

    self.currentSlotWidth =  function(progressWidth, maxSlotsForLevel) {
        var maxSlots = self.maxAvailableSlots();
        maxSlotsForLevel = parseInt(maxSlotsForLevel);
        var maxSlotWidth = (100 * maxSlotsForLevel) / maxSlots;
        return (progressWidth * maxSlotWidth+ '%');
    };


    self.editSlot = function(slot) {
        self.editItemIndex = slot.__id;
        self.currentEditItem(new Slot());
        self.currentEditItem().importValues(slot.exportValues());
        self.openModal(true);
        self.slots().forEach(function(slot, idx, _) {
            slot.maxSpellSlots.subscribe(self.dataHasChanged);
            slot.usedSpellSlots.subscribe(self.dataHasChanged);
        });
        self.dataHasChanged();
    };

    self.addSlot = function() {
        var slot = self.blankSlot();
        slot.characterId(CharacterManager.activeCharacter().key());
        slot.save();
        self.slots.push(slot);

        self.blankSlot(new Slot());
        self.blankSlot().level(self.slots().length + 1);
        self.slots().forEach(function(slot, idx, _) {
            slot.maxSpellSlots.subscribe(self.dataHasChanged);
            slot.usedSpellSlots.subscribe(self.dataHasChanged);
        });
        self.dataHasChanged();
        self.editSlots(false);
    };

    self.removeSlot = function(slot) {
        self.slots.remove(slot);
        slot.delete();
        self.blankSlot().level(self.slots().length + 1);
        self.slots().forEach(function(slot, idx, _) {
            slot.maxSpellSlots.subscribe(self.dataHasChanged);
            slot.usedSpellSlots.subscribe(self.dataHasChanged);
        });
        self.dataHasChanged();
        self.editSlots(false);
    };

    self.resetSlot = function(slot) {
        slot.usedSpellSlots(0);
    };

    self.resetSlots = function() {
        self.slots().forEach(function(slot, i, _) {
            slot.usedSpellSlots(0);
        });
    };

    self.clear = function() {
        self.slots([]);
    };

    self.dataHasChanged = function() {
        self.save();
        Notifications.spellSlots.changed.dispatch();
    };
    self.editMode.subscribe(self.setNewHeight);
}

ko.components.register('spell-slots', {
    viewModel: SpellSlotsViewModel,
    template: template
});
