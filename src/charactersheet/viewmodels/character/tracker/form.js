import ko from 'knockout';
import {debounce} from 'lodash';
import {DataRepository} from 'charactersheet/utilities';
import {FormComponentViewModel} from 'charactersheet/utilities';
import {Notifications} from 'charactersheet/utilities';
import {PersistenceService} from 'charactersheet/services/common/persistence_service';
import {Tracked} from 'charactersheet/models/character';
import meditationWhite from 'images/meditation.svg';
import campingTentWhite from 'images/camping-tent.svg';

import template from './form.html';

export class TrackedFormComponentViewModel extends FormComponentViewModel {
    constructor(params) {
        super(params)
        this.meditationWhite = meditationWhite;
        this.campingTentWhite = campingTentWhite;
    }

    generateBlank = () => (new Tracked());

    notify = () => {
        Notifications.tracked.changed.dispatch();
    }
}

ko.components.register('tracked-form', {
    viewModel: TrackedFormComponentViewModel,
    template: template
});
