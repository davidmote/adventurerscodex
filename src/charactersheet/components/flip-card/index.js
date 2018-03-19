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
  dataId: $data.__id,
  elementid: 'unique dom id',
  collapsable: collapsable,
  context: {
    data: $data,
    parent: $parent,
}
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
        // Unique id for the card's data
        this.dataId = ko.utils.unwrapObservable(params.dataId);
        // element id for collapsable behavior
        this.paramElementId = ko.utils.unwrapObservable(params.elementId);
        // unique identifier for this card
        this.elementId = `${this.paramElementId}_${this.dataId}`
        // Whether or not to trigger animations on collapse

        this.collapsable = ko.observable(ko.utils.unwrapObservable(params.collapsable) || false);

        // contextual data to be passed to children objects
        this.context = params.context;
        // Whether or not this 'back' is displayed.
        this.editMode = ko.observable(false);
        // calculated element height
        this.elementHeight = ko.observable(ko.utils.unwrapObservable(params.defaultHeight) || 'auto');

    }

    load = () => {
      $(window).on('load', debounce(this.setNewHeight, 50));
      $(window).on('resize', debounce(this.setNewHeight, 150));
    }

    shownCallback = () => {
      if(this.collapsable()){
        this.editMode(false);
        this.setNewHeight();
      }
    }

    hiddenCallback = () => {
      if(this.collapsable()){
        this.editMode(false);
        this.elementHeight('auto');
      }
    }

    toggleMode = (data, event) => {
      let toggleTo = (!this.editMode());
      if (data === true) { //override default behavior from function call
        toggleTo = true;

      } else if (data === false) { //override default behavior from function call
        toggleTo = false;
      }
      this.editMode(toggleTo);
      this.setNewHeight();
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
}

ko.components.register('flip-card', {
    viewModel: FlipCardComponentViewModel,
    template: template
});
