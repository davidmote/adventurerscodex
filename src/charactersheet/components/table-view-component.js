import { ACTableComponent } from 'charactersheet/components/table-component';
import ko from 'knockout';

export class ACTableViewModel extends ACTableComponent {
    constructor(params) {
        super(params);
        this.containerId = ko.utils.unwrapObservable(params.containerId);
        if (params.show) {
            this.show = params.show;
        } else {
            this.show = params.showBack;
        }
        this.flip = params.flip;
    }

    disposeOfSubscriptions () {
        this.subscriptions.forEach((subscription) => subscription.dispose());
        this.subscriptions = [];
    }

    dispose() {
        this.disposeOfSubscriptions();
    }

    setUpSubscriptions() {
        const showSubscription = this.show.subscribe(this.subscribeToShowForm);
        this.subscriptions.push(showSubscription);
    }

    subscribeToShowForm = () => {
        if (this.show()) {
            this.refresh();
        }
    }
}