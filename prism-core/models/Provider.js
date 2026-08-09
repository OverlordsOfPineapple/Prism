export class Provider {
  constructor({id=null,name='',logo='',type='streaming'}={}) {
    Object.assign(this,{id,name,logo,type});
    Object.freeze(this);
  }
}
