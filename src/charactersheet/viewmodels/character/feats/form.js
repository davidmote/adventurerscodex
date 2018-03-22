import ko from 'knockout';
import {debounce} from 'lodash';
import {
  CharacterManager,
  DataRepository,
  Fixtures } from 'charactersheet/utilities';
import { Feat, Tracked } from 'charactersheet/models/character';
import { Notifications } from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import meditationWhite from 'images/meditation.svg';
import campingTentWhite from 'images/camping-tent.svg';
import template from './form.html';
import uuid from 'node-uuid';
import { TrackedFormComponentViewModel} from 'charactersheet/utilities';


export class FeatFormComponentViewModel extends TrackedFormComponentViewModel {

      generateBlank = () => {
         return new Feat();
      }

      notify = () => {
        Notifications.feat.changed.dispatch();
      }

      trackedType = () => (Feat);


    // Pre-pop methods
    featsPrePopFilter = (request, response) => {
        const term = request.term.toLowerCase();
        let results = [];
        if (term && term.length > 2) {
            const keys = DataRepository.feats
                ?  Object.keys(DataRepository.feats)
                : [];
            results = keys.filter(function(name, idx, _) {
                return name.toLowerCase().indexOf(term) > -1;
            });
        }
        response(results);
    };

    populateFeat = (label, value) => {
      var feat = DataRepository.feats[label];
        if (feat) {
          this.currentEditItem().importValues(feat);
          this.shouldShowDisclaimer(true);
          this.resizeCallback();
        }
    };

    popoverText = () => ('Tracked Feats are listed in the Tracker.');

}

ko.components.register('feat-form', {
    viewModel: FeatFormComponentViewModel,
    template: template
});
