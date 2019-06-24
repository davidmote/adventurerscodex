import {
   AbilityScore,
   Armor,
   Item,
   MagicItem,
   Wealth,
   Weapon } from 'charactersheet/models';
import {
    CoreManager,
    Fixtures,
    Notifications,
    Utility
} from 'charactersheet/utilities';

import { KeyValuePredicate } from 'charactersheet/services/common/persistence_service_components/persistence_service_predicates';
import { PersistenceService } from 'charactersheet/services/common/persistence_service';
import { Status } from 'charactersheet/models/common/status';
import ko from 'knockout';
import { reduce } from 'lodash';

/**
 * A Status Service Component that tracks the total weight that a character
 * is carrying, and any modifiers that are applied due to this weight.
 */
export function TotalWeightStatusServiceComponent() {
    var self = this;

    self.statusIdentifier = 'Status.Encumbrance';
    self.strength = ko.observable();
    self.wealth = ko.observable();
    self.allMass = ko.observableArray([]);


    self.init = async function() {
        await self.load();
        self.setUpSubscriptions();
        // Calculate the first one.
    };

    self.setUpSubscriptions = () => {
        Notifications.abilityscore.changed.add(self.abilityScoreChanged);
        Notifications.wealth.changed.add(self.wealthChanged);

        Notifications.armor.added.add(self.massAdded);
        Notifications.armor.changed.add(self.massChanged);
        Notifications.armor.deleted.add(self.massDeleted);

        Notifications.item.added.add(self.massAdded);
        Notifications.item.changed.add(self.massChanged);
        Notifications.item.deleted.add(self.massDeleted);

        Notifications.magicitem.added.add(self.massAdded);
        Notifications.magicitem.changed.add(self.massChanged);
        Notifications.magicitem.deleted.add(self.massDeleted);

        Notifications.weapon.added.add(self.massAdded);
        Notifications.weapon.changed.add(self.massChanged);
        Notifications.weapon.deleted.add(self.massDeleted);
        Notifications.coreManager.changing.add(self.clear);
    };

    self.load = async () => {
        if (ko.utils.unwrapObservable(CoreManager.activeCore().type.name) !== 'character') {
            return;
        }
        self.strength(new AbilityScore());
        self.wealth(new Wealth());

        const coreUuid = CoreManager.activeCore().uuid();
        const strResponse = await AbilityScore.ps.list({coreUuid, name: Fixtures.abilityScores.constants.strength.name});
        const score = strResponse.objects[0];
        self.strength().importValues(score.exportValues());
        await self.wealth().load({ uuid: coreUuid });

        self.allMass.removeAll();
        const armorResponse = await Armor.ps.list({ coreUuid });
        self.allMass.push(...armorResponse.objects);

        const itemResponse = await Item.ps.list({ coreUuid });
        self.allMass.push(...itemResponse.objects);

        const magicItemResponse = await MagicItem.ps.list({ coreUuid });
        self.allMass.push(...magicItemResponse.objects);

        const weaponResponse = await Weapon.ps.list({ coreUuid });
        self.allMass.push(...weaponResponse.objects);
        self._updateStatus();

    };

    self.clear = () => {
        self.strength(null);
        self.wealth(null);
        self.allMass.removeAll();
    };

    self.abilityScoreChanged = function (abilityScore) {
        if (abilityScore.name() === Fixtures.abilityScores.constants.strength.name) {
            self.strength().importValues(abilityScore.exportValues());
            self._updateStatus();
        }
    };

    self.wealthChanged = function (wealth) {
        self.wealth().importValues(wealth.exportValues());
        self._updateStatus();
    };

    self.massAdded = function (item) {
        if (item) {
            const existingItem = find(self.allMass(), (mass)=> {
                return ko.utils.unwrapObservable(item).uuid() === ko.utils.unwrapObservable(mass).uuid();
            });
            if (!existingItem) {
                self.allMass.push(item);
                self._updateStatus();
            } else {
                // the mass was already added. change it instead
                self.massChanged(item);
            }
        }
    };

    self.massDeleted = function (item) {
        if (item) {
            self.allMass.remove(
              (entry) => {
                  return ko.utils.unwrapObservable(entry.uuid) === ko.utils.unwrapObservable(item.uuid);
              });
            self._updateStatus();
        }
    };

    self.massChanged = function (item) {
        if (item) {
            Utility.array.updateElement(self.allMass(), item, ko.utils.unwrapObservable(item.uuid));
            self._updateStatus();
        }
    };


    /**
     * This method generates and persists a status that reflects
     * the character's encumbrance.
     */

    self.getDescription = function(weight) {
        if (weight === 0) {
            return 'carrying nothing';
        }
        return 'carrying ~' + String(weight) + 'lbs';
    };

    self.getType = function(strength, weight) {
        if (weight === 0) {
            return 'default';
        } else if (weight < strength * 5) {
            return 'info';
        } else if (weight < strength * 10) {
            return 'warning';
        } else {
            return 'danger';
        }
    };

    /* Private Methods */

    self._updateStatus = async (score) => {
        var key = CoreManager.activeCore().uuid();
        var status = PersistenceService.findByPredicates(Status,
            [new KeyValuePredicate('characterId', key),
            new KeyValuePredicate('identifier', self.statusIdentifier)])[0];
        if (!status) {
            status = new Status();
            status.characterId(key);
            status.identifier(self.statusIdentifier);
        }

        let weight = 0;
        weight += self.getWeightForWealth();
        weight += self.getWeightForMass();
        weight.toFixed(1);
        status.name(self.getDescription(weight));
        status.type(self.getType(self.strength().value(), weight));

        status.save();
        Notifications.status.changed.dispatch();
    };

    self._removeStatus = function() {
        var key = CoreManager.activeCore().uuid();
        var status = PersistenceService.findByPredicates(Status,
            [new KeyValuePredicate('characterId', key),
            new KeyValuePredicate('identifier', self.statusIdentifier)])[0];
        if (status) {
            status.delete();
            Notifications.status.changed.dispatch();
        }
    };

    self.getWeightForMass = () => {
        return reduce(self.allMass(), function(sum, item) {
            const quantity = item.quantity ? item.quantity() : 1;
            // console.log(item.name(), ' weighs ', item.weight(), ' and there are ', quantity, 'of them');
            if (item.weight && item.weight() && quantity) {
                const weightValue = parseFloat(item.weight()).toFixed(2) * quantity;
                return sum + weightValue;
            }
            return sum;
        }, 0);
    };

    self.getWeightForWealth = () => {
        return self.wealth().totalWeight();
    };
}
