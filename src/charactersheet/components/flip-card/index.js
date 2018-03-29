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
             $(element).on('show.bs.collapse', shownCallback);
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

        this.tabId = ko.utils.unwrapObservable(params.tabId);
        // Whether or not to trigger animations on collapse
        this.collapsable = ko.observable(ko.utils.unwrapObservable(params.collapsable) || false);

        // contextual data to be passed to children objects
        this.context = params.context;
        // Whether or not this 'back' is displayed.

        this.editMode = ko.observable(false);
        this.showEditModeButton = ko.observable(true);

        if (params.editMode !== undefined) {
          this.editMode = params.editMode;
          this.showEditModeButton(false);
        }
        if (params.bubbleHeight) {
          this.bubbleHeight = params.bubbleHeight;
        }
        // calculated element height
        this.elementMeasure = ko.observable(0);
        if (params.defaultHeight) {
            const paramHeight = parseInt(ko.utils.unwrapObservable(params.defaultHeight));
            if (!Number.isNaN(paramHeight)) {
              this.elementMeasure(paramHeight);
            }
        }
        this.elementHeight = ko.computed(()=> {
          console.log(this.elementMeasure())
          return `${this.elementMeasure()}px`;
        });
        // this.elementMeasure = ko.observable(parseInt(ko.utils.unwrapObservable(params.defaultHeight)));
    }

    load = () => {
      const debounceHeight = debounce(this.setNewHeight, 50);
      $(window).on('load', this.setNewHeight);
      $(window).on('ready', this.setNewHeight);
      $(document).on('ready', this.setNewHeight);
      $(window).on('resize', this.setNewHeight);
      if (this.tabId) {
          $(`.nav-tabs a[href="#${this.tabId}"]`).on('shown.bs.tab', this.setNewHeight);
      }

      if (this.showEditModeButton() === false) {
      // trigger the new height on edit mode directly;
        // this.editMode.subscribe(this.setNewHeight);
      }
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
        this.elementMeasure(0);
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

    setNewHeight = (initialSetHeight) => {
        let setHeight = 0;
        if (this.editMode()) {
            setHeight = $(`#${this.elementId}_card > .back`).outerHeight();
        } else {
            setHeight = $(`#${this.elementId}_card > .front`).outerHeight();
        }

        if (setHeight && setHeight > 1) {
           // Add 25 to adjust for where in the dom the height has to be set to work with
           // collapse
            this.elementMeasure(setHeight+25);
          if (this.bubbleHeight) {
            setTimeout(this.bubbleHeight, 350);
          }
        // } else if (initialSetHeight && initialSetHeight !== 0 && initialSetHeight !== '0') {
        //   console.log('resizing to initial', this.elementId, setHeight);
        //   this.elementHeight(initialSetHeight);
        }

    }
}

ko.components.register('flip-card', {
    viewModel: FlipCardComponentViewModel,
    template: template
});