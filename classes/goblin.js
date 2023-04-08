class Goblin {
    constructor(name, color, characteristic, occupation, anomaly, equipment, attributes) {
      this.name = name;
      this.color = color;
      this.characteristic = characteristic;
      this.occupation = occupation;
      this.anomaly = anomaly;
      this.equipment = equipment;
      this.attributes = attributes;
      this.equipment_name = equipment.name;
      this.life = 4;
      this.level = 1;
      this.damage = [];
      this.area_damage = [];
      this.protection = 0;
      this.magic = 0;

      Object.keys(equipment).forEach(eqp => {
        let obj = equipment[eqp];
        if (typeof obj == "object") {
            if (obj["damage"]) {
                for (let i = 0; i < obj["qty"]; i++) {
                    this.damage.push(obj["damage"]);
                }
            }
            if (obj["protection"]) {
                this.protection = this.protection + obj["protection"];
            }
            if (obj["magic"]) {
                this.magic = 8;
            }
            if (obj["area_damage"]) {
                for (let i = 0; i < obj["qty"]; i++) {
                    this.area_damage.push(obj["area_damage"]);
                }            
            }
        }
      })

    }
  
    attack(target) {
      const damage = Math.floor(Math.random() * this.attributes.skill);
      target.takeDamage(damage);
      console.log(`${this.name} attacked ${target.name} for ${damage} damage.`);
    }
  
    takeDamage(damage) {
      this.life -= damage;
      if (this.life <= 0) {
        console.log(`${this.name} has been defeated!`);
      } else {
        console.log(`${this.name} took ${damage} damage and has ${this.life} life left.`);
      }
    }
  
    upgradeAttributes() {
      for (const attribute in this.attributes) {
        this.attributes[attribute] += 1;
      }
      console.log(`${this.name}'s attributes have been upgraded:`, this.attributes);
    }
  }

  module.exports = Goblin;
  