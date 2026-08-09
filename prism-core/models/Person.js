export class Person {
  constructor({id=null,name='',character='',job='',department='',photo='' }={}) {
    Object.assign(this,{id,name,character,job,department,photo});
    Object.freeze(this);
  }
}
