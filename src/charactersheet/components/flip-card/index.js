import ko from 'knockout';
import { debounce } from 'lodash';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';

import template from './index.html';

ko.bindingHandlers.collapseCard = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor();
        var hiddenCallback = ko.utils.unwrapObservable(value.hiddenCallback);
        var shownCallback = ko.utils.unwrapObservable(value.shownCallback);
        if (shownCallback) {
             // Register callbacks.
            $(element).on('shown.bs.collapse', shownCallback);
        }
        if (hiddenCallback) {
             // Register callbacks.
            $(element).on('hidden.bs.collapse', hiddenCallback);
        }
    },
    update:  function(element, valueAccessor, allBindingsAccessor) {
    }
};

/* Usage example
<flip-card params={
  data: $data,
  template: template,
  update: update,
  delete: delete,
  elementId: 'some-string'
}>
  <div class="front">
    Front of Card
  </div>
  <div class="back">
    Back of Card
  </div>
</flip-card>

*/
export class FlipCardComponentViewModel {
    constructor(params) {
        this.viewData = params.viewData;
        this.generateBlank = params.generateBlank;

        this.saveCallback = ko.utils.unwrapObservable(params.saveCallback);

        this.removeCallback = ko.utils.unwrapObservable(params.remove);

        this.paramElementId = params.elementId;

        this.collapsable = ko.observable(ko.utils.unwrapObservable(params.collapsable) || false);

        this.editMode = ko.observable(false);
        this.elementHeight = ko.observable(params.defaultHeight || 'auto');
        this.elementId = `${this.paramElementId}_${this.viewData.__id}`
        this.currentEditItem = ko.observable();
    }

    load = () => {
      $(window).on('load', debounce(this.setNewHeight, 50));
      $(window).on('resize', debounce(this.setNewHeight, 150));
    }

    shownCallback = () => {
        this.editMode(false);
        this.setNewHeight();
    }

    hiddenCallback = () => {
        this.editMode(false);
        this.elementHeight('auto');
    }

    toggleMode = () => {
        if(this.editMode()) {
            this.save();
            this.editMode(false);
            this.setNewHeight();
        } else {
          this.edit();
          this.editMode(true);
          this.setNewHeight();
        }
    }


    setNewHeight = () => {
        let setHeight = 0;
        if (this.editMode()) {
            setHeight = $(`#${this.elementId} .back`).height();
        } else {
            setHeight = $(`#${this.elementId} .front`).height();
        }
        if (setHeight && setHeight > 1) {
            this.elementHeight(setHeight.toString()+'px');
        }
    }

    edit = () => {
      this.currentEditItem(this.generateBlank());
      this.currentEditItem().importValues(this.viewData.exportValues())
    }

    save = () => {
      this.viewData.importValues(this.currentEditItem().exportValues());
      this.viewData.save();
      this.saveCallback(this.viewData);
      this.currentEditItem(this.generateBlank());
    }


    cancel = () => {
      this.editMode(false);
      this.currentEditItem(this.generateBlank());
      this.setNewHeight();
    }

    remove = () => {
      this.editMode(false);
      if (this.collapsable) {
        $(`#${this.elementId}`).collapse('hide');
      }
      setTimeout(()=>{
      this.removeCallback(this.viewData)},
      650);
    }
}

ko.components.register('flip-card', {
    viewModel: FlipCardComponentViewModel,
    template: template
});
