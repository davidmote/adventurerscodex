import ko from 'knockout';
import {debounce} from 'lodash';
import {
  DataRepository,
  Fixtures } from 'charactersheet/utilities';
import { Feature } from 'charactersheet/models/character';
import { Notifications } from 'charactersheet/utilities';
import { TrackedFormComponentViewModel} from 'charactersheet/utilities';

import template from './form.html';

export class FeatureFormComponentViewModel extends TrackedFormComponentViewModel {

    generateBlank = () => {
         return new Feature();
      }

      notify = () => {
        Notifications.feature.changed.dispatch();
      }

      trackedType = () => (Feature);

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
        this.currentEditItem().characterClass(value);
    };

    popoverText = () => ('Tracked Features are listed in the Tracker.');

}

ko.components.register('feature-form', {
    viewModel: FeatureFormComponentViewModel,
    template: template
});
