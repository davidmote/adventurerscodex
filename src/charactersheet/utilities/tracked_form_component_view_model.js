import ko from 'knockout';
import {debounce} from 'lodash';
import {CharacterManager, DataRepository, Fixtures} from 'charactersheet/utilities';
import {FormComponentViewModel} from './form_component_view_model';

import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Tracked} from 'charactersheet/models/character';
import meditationWhite from 'images/meditation.svg';
import campingTentWhite from 'images/camping-tent.svg';
import uuid from 'node-uuid';

export class TrackedFormComponentViewModel extends FormComponentViewModel {
    constructor(params) {
        super(params);

        this.currentEditTrackedItem = ko.observable();
        this.meditationWhite = meditationWhite;
        this.campingTentWhite = campingTentWhite;
    }

    generateBlank = () => {
        throw('you must provide a template');
    }

    notify = () => {
        throw('you must provide a notification system');
    }

    trackedType = () => {
        throw('you must provide a Tracked Type');
    }

    subscribeToShowForm = () => {
        if (this.showForm()) {
            if (this.data) {
                this.reset();
                this.currentEditItem().importValues(this.data.exportValues());
                if (this.data.isTracked()) {
                    const tracked = PersistenceService.findFirstBy(Tracked, 'trackedId', this.data.trackedId());
                    this.currentEditTrackedItem().importValues(tracked.exportValues());
                }
            }
            this.formElementHasFocus(true);
        } else {
            this.formElementHasFocus(false);
            if (this.bypassUpdate()) {
                this.bypassUpdate(false);
            } else {
                this.update();
            }
            this.reset();
        }
    }

    load = () => {
        this.reset();
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(this.subscribeToShowForm);

        ko.computed(() => this.currentEditItem().isTracked()).subscribe(() => {
            setTimeout(this.resizeCallback, 1);
        });

        this.shouldShowDisclaimer.subscribe(() => {
            setTimeout(this.resizeCallback, 1);
        });
    }

    update = () => {
        let tracked;

        if (!this.data) {
            this.currentEditItem().characterId(CharacterManager.activeCharacter().key());
        }
        if (this.currentEditItem().isTracked()) {
            if (this.currentEditItem().trackedId()) {
                tracked = PersistenceService.findFirstBy(Tracked, 'trackedId', this.currentEditItem().trackedId());
                tracked.importValues(this.currentEditTrackedItem().exportValues());
                tracked.save();
            } else {
                this.currentEditItem().trackedId(uuid.v4());
                tracked = this.addTracked(this.currentEditItem().trackedId(), this.currentEditItem().characterId(), this.currentEditTrackedItem());
            }
        } else if (this.currentEditItem().trackedId()) {
            const trackedToDelete = PersistenceService.findFirstBy(Tracked, 'trackedId', this.currentEditItem().trackedId());
            trackedToDelete.delete();
            this.currentEditItem().trackedId(null);
        }
        if (this.data) {
            this.data.importValues(this.currentEditItem().exportValues());
            this.data.save();
        } else {
            this.currentEditItem().save();
            this.addCallback(this.currentEditItem());
        }
        this.notify();
    }

    addTracked = (uuid, characterId, tracked) => {
        let newTracked = new Tracked();
        newTracked.characterId(characterId);
        newTracked.trackedId(uuid);
        newTracked.maxUses(tracked.maxUses());
        newTracked.resetsOn(tracked.resetsOn());
        newTracked.type(this.trackedType());
        const trackedList = PersistenceService.findBy(Tracked, 'characterId', characterId);
        newTracked.color(Fixtures.general.colorList[trackedList.length % Fixtures.general.colorList.length]);
        newTracked.save();
        return newTracked;
    };

    reset = () => {
        this.shouldShowDisclaimer(false);
        this.currentEditItem(this.generateBlank());
        this.currentEditTrackedItem(new Tracked());
    }
}
