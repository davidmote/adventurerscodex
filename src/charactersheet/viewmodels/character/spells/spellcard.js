import ko from 'knockout';
//data-bind="well: { open: moreInfoOpen }
import template from './spellcard.html';
/**
 * edit-button component
 * A useful component for displaying edit or save icons.
 * @param clickAction {function} a function to call on click
 * @param toggleMode {observable} Whether or not the button is toggled
 * Usage:
 */
 //
ko.bindingHandlers.autoHeight = {
    init: function(element, valueAccessor, allBindingsAccessor) {
        var value = valueAccessor();
        var callback = ko.utils.unwrapObservable(value.callback);

         // $(element).collapse({
         //     toggle: false
         // });
         //
        if (callback) {
             // Register callbacks.
            $(element).on('hidden.bs.collapse', callback);
            $(element).on('shown.bs.collapse', callback);
        }
         // ko.bindingHandlers.well.toggle(openOrClosed, element);
    }
     //
     // update: function(element, valueAccessor) {
     //     var value = valueAccessor();
     //     var openOrClosed = ko.utils.unwrapObservable(value.open);
     //     ko.bindingHandlers.well.toggle(openOrClosed, element);
     // },
     //
     // toggle: function(openOrClosed, element) {
     //     var action = openOrClosed ? 'show' : 'hide';
     //     $(element).collapse(action);
     // }
};

class SpellCardComponentViewModel {
    constructor(params) {
        this.spell = params.spell;
        this.editMode = ko.observable(false);
        this.elementHeight = ko.observable('auto');
    //     $(document).ready(function() {
    //
    //         $(window).resize(function() {
    //             this.setNewHeight();
    //         });
    //
    // // BOTH were required to work on any device "document" and "window".
    // // I don't know if newer jQuery versions fixed this issue for any device.
    //         $(document).resize(function() {
    //             this.setNewHeight();
    //         });
    //
    // // First processing when document is ready
    //         this.setNewHeight();
    //     });
    }

    load() {

        $(window).on('resize', ()=>(this.setNewHeight(this.editMode(), this.spell.__id)));
        // $(`#spell_list_${this.spell.__id} .back`).bind('heightChange', function(){
        //     alert('xxx');
        // });
        // $(`#spell_list_${this.spell.__id} .front`).bind('heightChange', function(){
        //     alert('xxx');
        // });
        // $(`#spell_list_${this.spell.__id} .front`).on('resize', this.setNewHeight);
    }

    toggleEditSpell() {

        if(this.editMode()) {
            this.editMode(false);
            this.setNewHeight();
        } else {
        // self.collapseAll();
        // $(id).collapse('show');
            this.editMode(true);
            this.setNewHeight();
        }
    // self.setNewHeight(id);
    }

    setNewHeight(editMode=this.editMode(), spellId=this.spell.__id) {
        let setHeight = 0;
        if (editMode) {
            setHeight = $(`#spell_list_${spellId} .back`).height();
            console.log('back: ', setHeight);
        } else {
            setHeight = $(`#spell_list_${spellId} .front`).height();
            console.log('front: ', setHeight);
        }
        if (setHeight && setHeight > 1) {
            console.log('yay new heights');
            //setHeight.toString()+'px';
            this.elementHeight(setHeight.toString()+'px');
        }
    }
}

// export function SpellCardComponentViewModel(params) {
//     var self = this;
//     self.spell =
//     console.log(params);
    // self.clickAction = params.clickAction;
    // self.toggleMode = params.toggleMode;
    //
    // self.editModeIcon = ko.pureComputed(() => (
    //      self.toggleMode() ? 'glyphicon-floppy-save' : 'glyphicon-pencil'
    // ));
//}

ko.components.register('spell-card', {
    viewModel: SpellCardComponentViewModel,
    template: template
});
