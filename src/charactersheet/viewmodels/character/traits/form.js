import ko from 'knockout';
import {debounce} from 'lodash';
import {
  DataRepository,
  Fixtures } from 'charactersheet/utilities';
import { TrackedFormComponentViewModel} from 'charactersheet/utilities';
import { Trait } from 'charactersheet/models/character';
import { Notifications } from 'charactersheet/utilities';
import template from './form.html';



export class TraitFormComponentViewModel extends TrackedFormComponentViewModel {

    generateBlank = () => {
       return new Trait();
    }

    notify = () => {
      Notifications.trait.changed.dispatch();
    }

    trackedType = () => (Trait);


    raceOptions = Fixtures.profile.raceOptions;

    // Pre-pop methods
    traitsPrePopFilter = (request, response) => {
        const term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            const keys = DataRepository.traits
                ?  Object.keys(DataRepository.traits)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateRace = (label, value) => {
        this.currentEditItem().race(value);
    };

    populateTrait = (label, value) => {
      var trait = DataRepository.traits[label];
        if (trait) {
          this.currentEditItem().importValues(trait);
          this.shouldShowDisclaimer(true);
          this.resizeCallback();
        }
    };

    popoverText = () => ('Tracked Traits are listed in the Tracker.');

}

ko.components.register('trait-form', {
    viewModel: TraitFormComponentViewModel,
    template: template
});
