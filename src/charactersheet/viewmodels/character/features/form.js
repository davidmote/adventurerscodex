import ko from 'knockout';
import {debounce} from 'lodash';
import {
  CharacterManager,
  DataRepository,
  Fixtures } from 'charactersheet/utilities';
import { Feature, Tracked } from 'charactersheet/models/character';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import meditationWhite from 'images/meditation.svg';
import campingTentWhite from 'images/camping-tent.svg';
import template from './form.html';
import uuid from 'node-uuid';

export class FeatureFormComponentViewModel {
    constructor(params) {
        this.data = params.data;
        this.showForm = params.showForm;
        this.toggle = params.toggle;
        this.addCallback = params.add;
        this.removeCallback = params.remove;
        this.resizeCallback = params.resizeCallback;

        this.containerId = ko.utils.unwrapObservable(params.containerId);
        this.currentEditItem = ko.observable(new Feature());
        this.currentEditTrackedItem = ko.observable(new Tracked());
        this.formElementHasFocus = ko.observable(false);
        this.addForm = ko.observable(false);
        this.bypassUpdate = ko.observable(false);

        this.shouldShowDisclaimer = ko.observable(false);

        this.meditationWhite = meditationWhite;
        this.campingTentWhite = campingTentWhite;
    }

    load = () => {
        if (this.data) {
            this.currentEditItem().importValues(this.data.exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new Feature());
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
                this.currentEditItem(new Feature());
                this.currentEditTrackedItem(new Tracked());
            }
        });
        ko.computed(() => this.currentEditItem().isTracked()).subscribe(() => {
          setTimeout(this.resizeCallback, 1);
        })
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
                tracked = this.addTracked(
                  this.currentEditItem().trackedId(),
                  this.currentEditItem().characterId(),
                  this.currentEditTrackedItem());
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
        Notifications.feature.changed.dispatch();
    }

    addTracked = (uuid, characterId, tracked) => {
        let newTracked = new Tracked();
        newTracked.characterId(characterId);
        newTracked.trackedId(uuid);
        newTracked.maxUses(tracked.maxUses());
        newTracked.resetsOn(tracked.resetsOn());
        newTracked.type(Feature);
        const trackedList = PersistenceService.findBy(Tracked, 'characterId', characterId);
        newTracked.color(Fixtures.general.colorList[trackedList.length
          % Fixtures.general.colorList.length]);
        newTracked.save();
        return newTracked;
    };

    save = () => {
        this.bypassUpdate(true);
        this.update();
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Feature());
        this.currentEditTrackedItem(new Tracked());
    }

    cancel = (data, event) => {
        this.bypassUpdate(true);
        this.toggle();
        this.shouldShowDisclaimer(false);
        this.currentEditItem(new Feature());
        this.currentEditTrackedItem(new Tracked());
    }

    remove = () => {
        $(`#${this.containerId}`).collapse('hide');
        setTimeout(() => {
            this.removeCallback(this.data);
            Notifications.feature.changed.dispatch()
        }, 650);
    }

    // Pre-pop methods
    featuresPrePopFilter = (request, response) => {
        const term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            const keys = DataRepository.features
                ? DataRepository.featuresDisplayNames
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    classOptions = Fixtures.profile.classOptions;

    populateFeature = (label, value) => {
        var feature = DataRepository.filterBy('features', 'displayName', label)[0];
        if (feature) {
          this.currentEditItem().importValues(feature);
          this.shouldShowDisclaimer(true);
          this.resizeCallback();
        }
    };

    populateClass = (label, value) => {
        self.currentEditItem().characterClass(value);
    };
}

ko.components.register('feature-form', {
    viewModel: FeatureFormComponentViewModel,
    template: template
});
