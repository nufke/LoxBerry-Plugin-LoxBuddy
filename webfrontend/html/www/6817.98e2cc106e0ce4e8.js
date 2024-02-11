"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[6817],{6817:(F,x,n)=>{n.r(x),n.d(x,{RoomsPageModule:()=>$});var i=n(7027),d=n(6814),p=n(6223),f=n(9515),_=n(6089),Z=n(2572),u=n(7398),o=n(5879),T=n(4898);function l(t,r){1&t&&(o.TgZ(0,"ion-row")(1,"ion-label",5)(2,"p",6),o._uU(3,"Favorites"),o.qZA()()())}function m(t,r){if(1&t&&(o.TgZ(0,"ion-card",9)(1,"ion-card-content",10)(2,"ion-item",11),o._UZ(3,"ion-icon",12),o.qZA(),o.TgZ(4,"ion-item",13)(5,"ion-label",14)(6,"h1"),o._uU(7),o.qZA()()()()()),2&t){const e=o.oxw().$implicit;o.hYB("routerLink","",e.serialNr,"/",e.uuid,""),o.xp6(3),o.s9C("src",e.icon.href),o.xp6(4),o.Oqu(e.name)}}function g(t,r){if(1&t&&(o.TgZ(0,"ion-col",7),o.YNc(1,m,8,4,"ion-card",8),o.qZA()),2&t){const e=r.$implicit;o.xp6(1),o.Q6J("ngIf",e.isFavorite)}}function v(t,r){1&t&&(o.TgZ(0,"ion-row")(1,"ion-label",5)(2,"p",6),o._uU(3,"Other rooms"),o.qZA()()())}function R(t,r){if(1&t&&(o.TgZ(0,"ion-col",15)(1,"ion-card",9)(2,"ion-card-content",10)(3,"ion-item",16),o._UZ(4,"ion-icon",17),o.TgZ(5,"ion-label",18)(6,"h1"),o._uU(7),o.qZA()()()()()()),2&t){const e=r.$implicit;o.xp6(1),o.hYB("routerLink","",e.serialNr,"/",e.uuid,""),o.xp6(3),o.s9C("src",e.icon.href),o.xp6(3),o.Oqu(e.name)}}function P(t,r){if(1&t&&(o.TgZ(0,"ion-grid"),o.YNc(1,l,4,0,"ion-row",2),o.TgZ(2,"ion-row"),o.YNc(3,g,2,1,"ion-col",3),o.qZA(),o.YNc(4,v,4,0,"ion-row",2),o.TgZ(5,"ion-row"),o.YNc(6,R,8,4,"ion-col",4),o.qZA()()),2&t){const e=r.ngIf;o.xp6(1),o.Q6J("ngIf",e.roomsFavs.length),o.xp6(2),o.Q6J("ngForOf",e.roomsFavs),o.xp6(1),o.Q6J("ngIf",e.roomsList.length),o.xp6(2),o.Q6J("ngForOf",e.roomsList)}}const C=[{path:"",component:(()=>{var t;class r{constructor(s,c){this.translate=s,this.controlService=c}ngOnInit(){this.initVM()}ngOnDestroy(){}ionViewWillEnter(){this.content.scrollToTop()}initVM(){this.vm$=(0,Z.a)([this.controlService.controls$,this.controlService.rooms$]).pipe((0,u.U)(([s,c])=>this.updateVM(s,c)))}updateVM(s,c){let O=s.filter(a=>a.isVisible).map(a=>a.room),L=c.filter(a=>a.isVisible&&!a.isFavorite&&O.indexOf(a.uuid)>-1).sort((a,h)=>a.order[0]-h.order[0]||a.name.localeCompare(h.name)),S=c.filter(a=>a.isVisible&&a.isFavorite&&O.indexOf(a.uuid)>-1).sort((a,h)=>a.order[1]-h.order[1]||a.name.localeCompare(h.name));return{rooms:c,roomsList:L,roomsFavs:S}}}return(t=r).\u0275fac=function(s){return new(s||t)(o.Y36(f.sK),o.Y36(T.B))},t.\u0275cmp=o.Xpm({type:t,selectors:[["app-rooms"]],viewQuery:function(s,c){if(1&s&&o.Gf(i.W2,5),2&s){let M;o.iGM(M=o.CRH())&&(c.content=M.first)}},decls:10,vars:6,consts:[["slot","start"],["autoHide","false"],[4,"ngIf"],["size","6","size-md","3",4,"ngFor","ngForOf"],["size","12","size-md","6",4,"ngFor","ngForOf"],[1,"control-label"],["translate",""],["size","6","size-md","3"],["class","card","class","card",3,"routerLink",4,"ngIf"],[1,"card",3,"routerLink"],[1,"card-content"],[1,"item-fav","ion-text-center"],[1,"icon-list",3,"src"],[1,"item-fav"],["text-wrap","",1,"label-list","text-flex"],["size","12","size-md","6"],[1,"item"],[1,"icon",3,"src"],["text-wrap","",1,"label","label-listitem"]],template:function(s,c){1&s&&(o.TgZ(0,"ion-header")(1,"ion-toolbar")(2,"ion-buttons",0),o._UZ(3,"ion-menu-button",1),o.qZA(),o.TgZ(4,"ion-title"),o._uU(5),o.ALo(6,"translate"),o.qZA()()(),o.TgZ(7,"ion-content"),o.YNc(8,P,7,4,"ion-grid",2),o.ALo(9,"async"),o.qZA()),2&s&&(o.xp6(5),o.Oqu(o.lcZ(6,2,"Rooms")),o.xp6(3),o.Q6J("ngIf",o.lcZ(9,4,c.vm$)))},dependencies:[i.Sm,i.PM,i.FN,i.wI,i.W2,i.jY,i.Gu,i.gu,i.Ie,i.Q$,i.fG,i.Nd,i.wd,i.sr,i.YI,d.sg,d.O5,_.rH,f.Pi,d.Ov,f.X$],styles:[".text-flex[_ngcontent-%COMP%]{display:flex;text-align:center}"]}),r})()}];let A=(()=>{var t;class r{}return(t=r).\u0275fac=function(s){return new(s||t)},t.\u0275mod=o.oAB({type:t}),t.\u0275inj=o.cJS({imports:[_.Bz.forChild(C),_.Bz]}),r})(),$=(()=>{var t;class r{}return(t=r).\u0275fac=function(s){return new(s||t)},t.\u0275mod=o.oAB({type:t}),t.\u0275inj=o.cJS({imports:[i.Pc,d.ez,p.u5,A,f.aw.forChild()]}),r})()},4898:(F,x,n)=>{n.d(x,{B:()=>Z});var i=n(7398),d=n(7081),p=n(5879),f=n(711),_=n(6119);let Z=(()=>{var u;class o{constructor(l,m){this.dataService=l,this.loxberryService=m}get controls$(){return this.dataService.controls$}get categories$(){return this.dataService.categories$}get rooms$(){return this.dataService.rooms$}getControl$(l,m){return this.dataService.controls$.pipe((0,i.U)(g=>g.find(v=>v.uuid===m&&v.serialNr===l)),(0,d.d)())}getSubControl$(l,m,g){return this.dataService.controls$.pipe((0,i.U)(v=>{const R=v.find(P=>P.uuid===m&&P.serialNr===l&&P.subControls[g].uuid===g);if(R)return R.subControls[g]}),(0,d.d)())}updateControl(l,m){this.loxberryService.sendMessage(l,m)}}return(u=o).\u0275fac=function(l){return new(l||u)(p.LFG(f.D),p.LFG(_.$))},u.\u0275prov=p.Yz7({token:u,factory:u.\u0275fac,providedIn:"root"}),o})()}}]);