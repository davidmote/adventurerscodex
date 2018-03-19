import 'bin/knockout-bootstrap-modal';
import {
    CharacterManager,
    Notifications
} from 'charactersheet/utilities';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { SpellStats } from 'charactersheet/models/character';
import ko from 'knockout';
import template from './form.html';

export class SpellStatsFormViewModel {
    constructor(params) {
      this.data = params.data;
      this.showForm = params.showForm;
      this.toggle = params.toggle;
      this.dataHasChangedCallback = params.dataChanged;
      this.containerId = ko.utils.unwrapObservable(params.containerId);
      this.currentEditItem = ko.observable();
      this.formElementHasFocus = ko.observable(false);
      this.addForm = ko.observable(false);
      this.bypassUpdate = ko.observable(false);
    }

    load = () => {
        this.currentEditItem(new SpellStats());
        if (this.data) {
            this.currentEditItem().importValues(this.data().exportValues());
        } else {
            this.addForm(true);
        }

        this.showForm.subscribe(() => {
            if (this.showForm()) {
                if (this.data) {
                    this.currentEditItem(new SpellStats());
                    this.currentEditItem().importValues(this.data().exportValues());
                }
                this.formElementHasFocus(true);
            } else {
                this.formElementHasFocus(false);
                if (this.bypassUpdate()) {
                    this.bypassUpdate(false);
                } else {
                    this.update();
                }
                this.currentEditItem(new SpellStats());
            }
        });
    }

    submit = () => {
      this.bypassUpdate(true);
      this.update();
      this.toggle();
    };

    update = () => {
        this.data().importValues(this.currentEditItem().exportValues())
        this.data().save();
        this.dataHasChangedCallback();
    };

    setSpellCastingAbility = (label, value) => {
        this.currentEditItem().spellcastingAbility(label);
    };

    // self.editMode.subscribe(self.setNewHeight);

    // Modal Methods

    // editSpellStats = () => {
    //     self.modalStatus(true);
    //     self.editItem(new SpellStats());
    //     self.editItem().importValues(self.spellStats().exportValues());
    // };
    //
    // self.modalFinishedAnimating = function() {
    //     self.firstModalElementHasFocus(true);
    //     self.firstModalElementHasFocus.valueHasMutated();
    // };
    //
    // self.modalFinishedClosing = function() {
    //     if (self.modalStatus()) {
    //         self.spellStats().importValues(self.editItem().exportValues());
    //     }
    //     self.dataHasChanged();
    //     self.modalStatus(false);
    // };
    //
    // self.dataHasChanged = function() {
    //     self.spellStats().save();
    //     Notifications.spellStats.changed.dispatch();
    // };
}

ko.components.register('spell-stats-form', {
    viewModel: SpellStatsFormViewModel,
    template: template
});
